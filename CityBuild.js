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
const buildRulesFor_1 = require("./lib/buildRulesFor");
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
        this._availableCityBuildItemsRegistry = availableCityBuildItemsRegistry;
        this._city = city;
        this._ruleRegistry = ruleRegistry;
        this.addKey('auto', 'available', 'building', 'city', 'cleared', 'cost', 'progress', 'remaining');
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
    build(ItemToBuild) {
        const buildItem = this.getAvailable(ItemToBuild);
        if (!buildItem) {
            throw new TypeError(`Cannot build ${ItemToBuild.name}, it's not available.`);
        }
        this._building = buildItem;
        this._cleared = null;
        this._cost.set(this._building.cost().value());
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
        this._ruleRegistry.process(BulidingCancelled_1.default, this);
    }
    check() {
        if (this._progress.value() >= this._cost.value() && this._building) {
            const built = this._building.item().build(this._city, this._ruleRegistry);
            this._progress.set(0);
            this._cleared = {
                reason: 'completed',
                item: this._building.item(),
            };
            this._building = null;
            this._cost.set(Infinity);
            this._ruleRegistry.process(BulidingComplete_1.default, this, built);
            return built;
        }
        return null;
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
    cost() {
        return this._cost;
    }
    getAvailable(Item) {
        return this.available().filter((available) => available.item() === Item)[0];
    }
    progress() {
        return this._progress;
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
    }
}
exports.CityBuild = CityBuild;
CityBuild.transient = [
    '_availableCityBuildItemsRegistry',
    '_ruleRegistry',
];
exports.default = CityBuild;
//# sourceMappingURL=CityBuild.js.map