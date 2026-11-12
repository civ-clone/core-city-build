"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CityBuild = void 0;
const AvailableCityBuildItemsRegistry_1 = require("./AvailableCityBuildItemsRegistry");
const DataObject_1 = require("@civ-clone/core-data-object/DataObject");
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const Build_1 = require("./Rules/Build");
const BuildItem_1 = require("./BuildItem");
const Yields_1 = require("./Yields");
const BulidingCancelled_1 = require("./Rules/BulidingCancelled");
const BulidingComplete_1 = require("./Rules/BulidingComplete");
const BuildingHeld_1 = require("./Rules/BuildingHeld");
const Hold_1 = require("./Rules/Hold");
const buildRulesFor_1 = require("./lib/buildRulesFor");
// What a build sends a client: a constructor adds them, and `onHydrated` adds any a save from before one was added
//  doesn't have.
const cityBuildKeys = [
    'auto',
    'available',
    'building',
    'city',
    'cleared',
    'cost',
    'held',
    'progress',
    'queue',
    'queueDropped',
    'remaining',
];
// The builds being settled (see `CityBuild#settle`). Kept here, not on the build, so it is no part of a save.
const settling = new WeakSet();
class CityBuild extends DataObject_1.DataObject {
    constructor(city, availableCityBuildItemsRegistry = AvailableCityBuildItemsRegistry_1.instance, ruleRegistry = RuleRegistry_1.instance) {
        super();
        // Whether the city chooses what it builds next by itself (civ-clone/web-renderer#194). Nothing here acts on it: the
        //  ruleset's `BuildingComplete` and `BuildingCancelled` rules do, with `lib/autoBuild`.
        this._auto = false;
        this._building = null;
        this._cleared = null;
        this._cost = new Yields_1.BuildProgress(Infinity);
        this._progress = new Yields_1.BuildProgress();
        // What the city builds after the current item, in order (civ-clone/web-renderer#774), and what the last move to the
        //  next of them dropped, as it could no longer be built.
        this._queue = [];
        this._queueDropped = [];
        this._availableCityBuildItemsRegistry = availableCityBuildItemsRegistry;
        this._city = city;
        this._ruleRegistry = ruleRegistry;
        this.addKey(...cityBuildKeys);
    }
    add(production) {
        this._progress.add(production);
    }
    auto() {
        // A build restored from a save made before Auto existed has no `_auto` at all.
        return this._auto === true;
    }
    available() {
        const buildRules = this._ruleRegistry.get(Build_1.default);
        // Each item is only checked against the rules that could apply to it (`buildRulesFor`), not all ~100 of them.
        //  Rules that declare no item are still checked against everything.
        // TODO: this still feels awkward... It's either this, or every rule has to be 'either it isn't this thing we're
        //  checking or it is and it meets the condition' or it's this. It'd be nice to be able to just filter the list in a
        //  more straightforward way...
        return this._availableCityBuildItemsRegistry.filter((BuildItem) => (0, buildRulesFor_1.buildRulesFor)(buildRules, BuildItem)
            .filter((rule) => rule.validate(this.city(), BuildItem))
            .every((rule) => rule.process(this.city(), BuildItem).validate())).map((available) => new BuildItem_1.default(available, this.city(), this._ruleRegistry));
    }
    /**
     * Every item `available()` leaves out, with the ids of the rules that refused it, for saying why a city can't build
     * something (civ-clone/web-renderer#37): a ruleset's requirement entries share their rules' ids, so an id names what
     * is missing. It asks the same rules `available()` does; `available()` itself doesn't use it, as it can stop at the
     * first refusal. Unlike `available()`, it runs every applicable rule for an item, so a rule must not rely on an earlier
     * one having refused first.
     */
    unavailable() {
        const buildRules = this._ruleRegistry.get(Build_1.default);
        return this._availableCityBuildItemsRegistry.entries()
            .map((BuildItem) => ({
            item: BuildItem,
            refusedBy: (0, buildRulesFor_1.buildRulesFor)(buildRules, BuildItem)
                .filter((rule) => rule.validate(this.city(), BuildItem))
                .filter((rule) => !rule.process(this.city(), BuildItem).validate())
                .map((rule) => rule.id()),
        }))
            .filter(({ refusedBy }) => refusedBy.length > 0);
    }
    /**
     * Starts building `ItemToBuild`. Chosen by the player while it's first in the queue, it's that queued item: it leaves
     *  the queue rather than being built twice.
     */
    choose(ItemToBuild) {
        this.build(ItemToBuild);
        if (this.queued()[0] === ItemToBuild) {
            this.dequeue(0);
        }
    }
    build(ItemToBuild) {
        const buildItem = this.getAvailable(ItemToBuild);
        if (!buildItem) {
            throw new TypeError(`Cannot build ${ItemToBuild.name}, it's not available.`);
        }
        this._building = buildItem;
        this._cleared = null;
        this._cost.set(this._building.cost().value());
        // A choice made for its own sake, not as part of moving on from the last item: what that move dropped has been
        //  said, and is said no more (civ-clone/web-renderer#875).
        if (!settling.has(this)) {
            this._queueDropped = [];
        }
    }
    building() {
        return this._building;
    }
    /**
     * Stops building the current item, if any, and processes the `BuildingCancelled` rules. Progress is kept. `reason` is
     *  what `cleared()` gives, set before the rules run, so a rule that chooses another build clears it again.
     */
    cancel(reason = 'cancelled') {
        if (this._building === null) {
            return;
        }
        this._cleared = {
            reason,
            item: this._building.item(),
        };
        this._building = null;
        this._cost.set(Infinity);
        this.settle(() => {
            this.queueAfterClearing(reason);
            this._ruleRegistry.process(BulidingCancelled_1.default, this);
        });
    }
    /**
     * Completes the item being built once its progress has reached the cost and no `Hold` rule holds it (`held()` is
     *  empty), and gives what was built. Otherwise gives `null`, and changes nothing: a held item stays chosen, and its
     *  progress goes on adding up.
     *
     * Each time it doesn't complete an item that is paid for because `Hold` rules hold it, it processes the
     *  `BuildingHeld` rules, with the item and the ids `held()` gives (civ-clone/web-renderer#970): in play, once a turn
     *  for as long as the build waits. Nothing is kept to know whether it has been said before; that is for whoever
     *  listens.
     */
    check() {
        if (!(this._progress.value() >= this._cost.value()) || !this._building) {
            return null;
        }
        const held = this.held();
        if (held.length > 0) {
            this._ruleRegistry.process(BuildingHeld_1.default, this, this._building.item(), held);
            return null;
        }
        const built = this._building.item().build(this._city, this._ruleRegistry);
        this._progress.set(0);
        this._cleared = {
            reason: 'completed',
            item: this._building.item(),
        };
        this._building = null;
        this._cost.set(Infinity);
        this.settle(() => {
            // Before the rules, so a ruleset's own choice of what's next (Auto, a standing order) finds the city building
            //  the next queued item and leaves it be: those apply once the queue is empty.
            this.advanceQueue();
            this._ruleRegistry.process(BulidingComplete_1.default, this, built);
        });
        return built;
    }
    city() {
        return this._city;
    }
    /** Why the city is building nothing, or `null` while it builds something, or when that isn't known (an older save). */
    cleared() {
        var _a;
        if (this._building !== null) {
            return null;
        }
        // A build restored from a save made before this existed has no `_cleared` at all.
        return (_a = this._cleared) !== null && _a !== void 0 ? _a : null;
    }
    /** Empties the queue. */
    clearQueue() {
        this._queue = [];
    }
    cost() {
        return this._cost;
    }
    /** Removes the queued item at `index`. A negative one is the first; one past the end does nothing. */
    dequeue(index) {
        const queued = [...this.queued()];
        queued.splice(Math.max(0, index), 1);
        this._queue = queued;
    }
    /**
     * Lines `Item` up to build after the current item: at the end, or at `at`. Only what the city can build now; one it
     *  can't by the time it's reached is dropped then (`queueDropped`).
     */
    enqueue(Item, at = this.queued().length) {
        if (!this.getAvailable(Item)) {
            throw new TypeError(`Cannot queue ${Item.name}, it's not available.`);
        }
        const queued = [...this.queued()];
        queued.splice(Math.max(0, Math.min(at, queued.length)), 0, Item);
        this._queue = queued;
    }
    /**
     * A build loaded from a save has the keys it had when it was saved: one made before the queue existed would never
     *  send it (civ-clone/web-renderer#774). Adds those it's missing.
     */
    onHydrated() {
        const keys = this.keys();
        this.addKey(...cityBuildKeys.filter((key) => !keys.includes(key)));
    }
    getAvailable(Item) {
        return this.available().filter((available) => available.item() === Item)[0];
    }
    /**
     * The ids of the enabled `Hold` rules whose criteria are met for what the city is building (`null` for a rule with
     *  no id), whatever its progress (civ-clone/web-renderer#959): a ruleset's own reasons, which a client can word, as
     *  `unavailable()`'s `refusedBy`. `check()` doesn't complete the item while any are given. A client combines it with
     *  `remaining()`: ids with something still to pay mean the item will wait once it is paid for, and ids with nothing
     *  left to pay mean it is waiting now. Empty while the city builds nothing, or nothing holds the item. Worked out
     *  when asked, so it follows the city as it changes, and its value is never saved: a save holds only the key's name,
     *  among the build's keys, which `onHydrated` adds back to a build saved without it. It is `heldFor` the item being
     *  built.
     */
    held() {
        if (this._building === null) {
            return [];
        }
        return this.heldFor(this._building.item());
    }
    /**
     * The ids of the enabled `Hold` rules that would hold this city's build of `Item` (`null` for a rule with no id),
     *  whether the city is building it, something else or nothing (civ-clone/web-renderer#970): for a build menu to say,
     *  beside an item, that it would wait once paid for. Not sent with the build: a client asks it for the items it shows.
     *
     * The answer is for the city as it is now. Beside a queued item it means "would wait if the city reached it as it is
     *  now", which can be wrong either way: a size-2 city with Settlers twice in its queue will hold the second, though
     *  the answer is none, and a size-1 city that will have grown by then is told Settlers would wait, though they won't.
     *
     * `Item` is the class an item is built from, as `building().item()` and `queued()` give it: something a city can
     *  build, with a static `build`. Anything else (a `BuildItem`, an instance, `null`, `undefined`, a function or class
     *  with no `build`) is a `TypeError`, rather than an answer about something else. Whether this city may build it is
     *  not asked: that is `available()`.
     */
    heldFor(Item) {
        if (typeof Item !== 'function' || typeof Item.build !== 'function') {
            throw new TypeError(`Cannot say what would hold ${String(Item)}, it's not something a city builds.`);
        }
        return this._ruleRegistry
            .get(Hold_1.default)
            .filter((rule) => rule.validate(this, Item))
            .map((rule) => rule.id());
    }
    progress() {
        return this._progress;
    }
    /** The queued items, priced for the city as it is now, for a client to show their cost and turns. */
    queue() {
        return this.queued().map((item) => new BuildItem_1.default(item, this.city(), this._ruleRegistry));
    }
    /** What the city builds after the current item, in order (civ-clone/web-renderer#774). */
    queued() {
        var _a;
        // A build restored from a save made before the queue existed has no `_queue` at all.
        return (_a = this._queue) !== null && _a !== void 0 ? _a : [];
    }
    /**
     * What the last move to the next queued item dropped, as the city could no longer build it. Empty again once
     * something is chosen for the city for its own sake: by its player, or by anything else that calls `build`.
     */
    queueDropped() {
        var _a;
        return (_a = this._queueDropped) !== null && _a !== void 0 ? _a : [];
    }
    remaining() {
        return this._cost.value() - this._progress.value();
    }
    /**
     * Prices what the city is building again, for the city as it is now. A `BuildCostModifier` may depend on who owns
     *  the city, so a city that changes hands re-prices its build (civ-clone/web-renderer#500).
     */
    reprice() {
        if (this._building === null) {
            return;
        }
        this._building = new BuildItem_1.default(this._building.item(), this.city(), this._ruleRegistry);
        this._cost.set(this._building.cost().value());
    }
    /** Moves the queued item at `from` to `to`, both clamped to the queue. A `from` past the end does nothing. */
    requeue(from, to) {
        const queued = [...this.queued()], [moved] = queued.splice(Math.max(0, from), 1);
        if (moved === undefined) {
            return;
        }
        queued.splice(Math.max(0, Math.min(to, queued.length)), 0, moved);
        this._queue = queued;
    }
    revalidate() {
        if (this._building && !this.getAvailable(this._building.item())) {
            this.cancel('unavailable');
        }
    }
    setAuto(auto) {
        this._auto = auto;
    }
    /** Records why the city is building nothing, for a reason the build itself doesn't know, such as a new city. */
    setCleared(reason, item = null) {
        this._cleared = {
            reason,
            item,
        };
        this.queueAfterClearing(reason);
    }
    /**
     * Starts the first queued item the city can still build, dropping any before it that it can't (`queueDropped`).
     *  Leaves the city building nothing when none is left.
     */
    advanceQueue() {
        const queued = [...this.queued()], dropped = [];
        while (queued.length > 0) {
            const next = queued.shift();
            if (this.getAvailable(next)) {
                this._queue = queued;
                this.build(next);
                break;
            }
            dropped.push(next);
        }
        this._queue = queued;
        // After `build`, which forgets the last move's when it is called for its own sake.
        this._queueDropped = dropped;
    }
    // Runs what follows from the current item being finished or cleared: what is chosen while it runs (the next queued
    //  item, Auto's choice, a rule's) is part of that, and leaves `queueDropped` for whoever reports it.
    settle(what) {
        const already = settling.has(this);
        settling.add(this);
        try {
            what();
        }
        finally {
            if (!already) {
                settling.delete(this);
            }
        }
    }
    /**
     * What the queue does when the build is cleared for `reason`: a city that has changed hands drops its previous
     *  owner's queue. Otherwise it's kept: a city that can no longer build its item (a rival finished the Wonder) is left
     *  for its player to choose, and told why, as without a queue, and the queue goes on after whatever they choose. A
     *  city on Auto isn't asked, so it goes on to its queue, before Auto chooses for it.
     */
    queueAfterClearing(reason) {
        if (reason === 'captured') {
            this.clearQueue();
            this._queueDropped = [];
            return;
        }
        if (reason === 'unavailable' && this.auto()) {
            this.advanceQueue();
        }
    }
}
exports.CityBuild = CityBuild;
CityBuild.transient = [
    '_availableCityBuildItemsRegistry',
    '_ruleRegistry',
];
exports.default = CityBuild;
//# sourceMappingURL=CityBuild.js.map