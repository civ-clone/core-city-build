import {
  AvailableCityBuildItemsRegistry,
  instance as availableCityBuildItemsRegistryInstance,
} from './AvailableCityBuildItemsRegistry';
import {
  DataObject,
  IDataObject,
} from '@civ-clone/core-data-object/DataObject';
import {
  RuleRegistry,
  instance as ruleRegistryInstance,
} from '@civ-clone/core-rule/RuleRegistry';
import Build from './Rules/Build';
import BuildItem from './BuildItem';
import { BuildProgress } from './Yields';
import { IBuildable as Buildable } from './Buildable';
import BuildingCancelled from './Rules/BulidingCancelled';
import BuildingComplete from './Rules/BulidingComplete';
import City from '@civ-clone/core-city/City';
import Hold from './Rules/Hold';
import { IConstructor } from '@civ-clone/core-registry/Registry';
import Yield from '@civ-clone/core-yield/Yield';
import { buildRulesFor } from './lib/buildRulesFor';

/** An item a city can't build, and the ids of the rules that refused it (`null` for a rule with no id). */
export interface IUnavailableBuildItem {
  item: Buildable;
  refusedBy: (string | null)[];
}

/**
 * Why a city is building nothing (civ-clone/web-renderer#716): it finished `item` (`completed`), stopped building it
 *  (`cancelled`), or could no longer build it (`unavailable`); or the city is new (`created`) or has changed hands
 *  (`captured`). A ruleset may give its own reasons.
 */
export type CityBuildClearedReason =
  | 'cancelled'
  | 'captured'
  | 'completed'
  | 'created'
  | 'unavailable'
  | string;

export interface ICityBuildCleared {
  reason: CityBuildClearedReason;
  item: Buildable | null;
}

export interface ICityBuild extends IDataObject {
  add(production: Yield): void;
  auto(): boolean;
  available(): BuildItem[];
  build(ItemToBuild: Buildable): void;
  building(): BuildItem | null;
  cancel(reason?: CityBuildClearedReason): void;
  check(): void;
  choose(ItemToBuild: Buildable): void;
  cleared(): ICityBuildCleared | null;
  clearQueue(): void;
  cost(): BuildProgress;
  dequeue(index: number): void;
  enqueue(Item: Buildable, at?: number): void;
  getAvailable(Item: Buildable): BuildItem;
  held(): (string | null)[];
  progress(): BuildProgress;
  queue(): BuildItem[];
  queued(): Buildable[];
  queueDropped(): Buildable[];
  remaining(): number;
  reprice(): void;
  requeue(from: number, to: number): void;
  revalidate(): void;
  setAuto(auto: boolean): void;
  setCleared(reason: CityBuildClearedReason, item?: Buildable | null): void;
  unavailable(): IUnavailableBuildItem[];
}

// What a build sends a client: a constructor adds them, and `onHydrated` adds any a save from before one was added
//  doesn't have.
const cityBuildKeys: (keyof CityBuild)[] = [
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
const settling = new WeakSet<object>();

export class CityBuild extends DataObject implements ICityBuild {
  static readonly transient = [
    '_availableCityBuildItemsRegistry',
    '_ruleRegistry',
  ];
  // Whether the city chooses what it builds next by itself (civ-clone/web-renderer#194). Nothing here acts on it: the
  //  ruleset's `BuildingComplete` and `BuildingCancelled` rules do, with `lib/autoBuild`.
  private _auto: boolean = false;
  private _availableCityBuildItemsRegistry: AvailableCityBuildItemsRegistry;
  private _building: BuildItem | null = null;
  private _city: City;
  private _cleared: ICityBuildCleared | null = null;
  private _cost: BuildProgress = new BuildProgress(Infinity);
  private _progress: BuildProgress = new BuildProgress();
  // What the city builds after the current item, in order (civ-clone/web-renderer#774), and what the last move to the
  //  next of them dropped, as it could no longer be built.
  private _queue: Buildable[] = [];
  private _queueDropped: Buildable[] = [];
  private _ruleRegistry: RuleRegistry;

  constructor(
    city: City,
    availableCityBuildItemsRegistry: AvailableCityBuildItemsRegistry = availableCityBuildItemsRegistryInstance,
    ruleRegistry: RuleRegistry = ruleRegistryInstance
  ) {
    super();

    this._availableCityBuildItemsRegistry = availableCityBuildItemsRegistry;
    this._city = city;
    this._ruleRegistry = ruleRegistry;

    this.addKey(...cityBuildKeys);
  }

  add(production: Yield): void {
    this._progress.add(production);
  }

  auto(): boolean {
    // A build restored from a save made before Auto existed has no `_auto` at all.
    return this._auto === true;
  }

  available(): BuildItem[] {
    const buildRules = this._ruleRegistry.get(Build);

    // Each item is only checked against the rules that could apply to it (`buildRulesFor`), not all ~100 of them.
    //  Rules that declare no item are still checked against everything.
    // TODO: this still feels awkward... It's either this, or every rule has to be 'either it isn't this thing we're
    //  checking or it is and it meets the condition' or it's this. It'd be nice to be able to just filter the list in a
    //  more straightforward way...
    return (
      this._availableCityBuildItemsRegistry.filter(
        (BuildItem: Buildable): boolean =>
          buildRulesFor(buildRules, BuildItem)
            .filter((rule: Build): boolean =>
              rule.validate(this.city(), BuildItem)
            )
            .every((rule: Build): boolean =>
              rule.process(this.city(), BuildItem).validate()
            )
      ) as Buildable[]
    ).map(
      (available) => new BuildItem(available, this.city(), this._ruleRegistry)
    );
  }

  /**
   * Every item `available()` leaves out, with the ids of the rules that refused it, for saying why a city can't build
   * something (civ-clone/web-renderer#37): a ruleset's requirement entries share their rules' ids, so an id names what
   * is missing. It asks the same rules `available()` does; `available()` itself doesn't use it, as it can stop at the
   * first refusal. Unlike `available()`, it runs every applicable rule for an item, so a rule must not rely on an earlier
   * one having refused first.
   */
  unavailable(): IUnavailableBuildItem[] {
    const buildRules = this._ruleRegistry.get(Build);

    return (this._availableCityBuildItemsRegistry.entries() as Buildable[])
      .map(
        (BuildItem: Buildable): IUnavailableBuildItem => ({
          item: BuildItem,
          refusedBy: buildRulesFor(buildRules, BuildItem)
            .filter((rule: Build): boolean =>
              rule.validate(this.city(), BuildItem)
            )
            .filter(
              (rule: Build): boolean =>
                !rule.process(this.city(), BuildItem).validate()
            )
            .map((rule: Build): string | null => rule.id()),
        })
      )
      .filter(
        ({ refusedBy }: IUnavailableBuildItem): boolean => refusedBy.length > 0
      );
  }

  /**
   * Starts building `ItemToBuild`. Chosen by the player while it's first in the queue, it's that queued item: it leaves
   *  the queue rather than being built twice.
   */
  choose(ItemToBuild: Buildable): void {
    this.build(ItemToBuild);

    if (this.queued()[0] === ItemToBuild) {
      this.dequeue(0);
    }
  }

  build(ItemToBuild: Buildable): void {
    const buildItem = this.getAvailable(ItemToBuild);

    if (!buildItem) {
      throw new TypeError(
        `Cannot build ${ItemToBuild.name}, it's not available.`
      );
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

  building(): BuildItem | null {
    return this._building;
  }

  /**
   * Stops building the current item, if any, and processes the `BuildingCancelled` rules. Progress is kept. `reason` is
   *  what `cleared()` gives, set before the rules run, so a rule that chooses another build clears it again.
   */
  cancel(reason: CityBuildClearedReason = 'cancelled'): void {
    if (this._building === null) {
      return;
    }

    this._cleared = {
      reason,
      item: this._building.item(),
    };
    this._building = null;
    this._cost.set(Infinity);

    this.settle((): void => {
      this.queueAfterClearing(reason);

      this._ruleRegistry.process(BuildingCancelled, this);
    });
  }

  /**
   * Completes the item being built once its progress has reached the cost and no `Hold` rule holds it (`held()` is
   *  empty), and gives what was built. Otherwise gives `null`, and changes nothing: a held item stays chosen, and its
   *  progress goes on adding up.
   */
  check(): IDataObject | null {
    if (
      this._progress.value() >= this._cost.value() &&
      this._building &&
      this.held().length === 0
    ) {
      const built = this._building.item().build(this._city, this._ruleRegistry);

      this._progress.set(0);
      this._cleared = {
        reason: 'completed',
        item: this._building.item(),
      };
      this._building = null;
      this._cost.set(Infinity);

      this.settle((): void => {
        // Before the rules, so a ruleset's own choice of what's next (Auto, a standing order) finds the city building
        //  the next queued item and leaves it be: those apply once the queue is empty.
        this.advanceQueue();

        this._ruleRegistry.process(BuildingComplete, this, built);
      });

      return built;
    }

    return null;
  }

  city(): City {
    return this._city;
  }

  /** Why the city is building nothing, or `null` while it builds something, or when that isn't known (an older save). */
  cleared(): ICityBuildCleared | null {
    if (this._building !== null) {
      return null;
    }

    // A build restored from a save made before this existed has no `_cleared` at all.
    return this._cleared ?? null;
  }

  /** Empties the queue. */
  clearQueue(): void {
    this._queue = [];
  }

  cost(): BuildProgress {
    return this._cost;
  }

  /** Removes the queued item at `index`. A negative one is the first; one past the end does nothing. */
  dequeue(index: number): void {
    const queued = [...this.queued()];

    queued.splice(Math.max(0, index), 1);

    this._queue = queued;
  }

  /**
   * Lines `Item` up to build after the current item: at the end, or at `at`. Only what the city can build now; one it
   *  can't by the time it's reached is dropped then (`queueDropped`).
   */
  enqueue(Item: Buildable, at: number = this.queued().length): void {
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
  onHydrated(): void {
    const keys = this.keys();

    this.addKey(...cityBuildKeys.filter((key) => !keys.includes(key)));
  }

  getAvailable(Item: Buildable): BuildItem {
    return this.available().filter(
      (available: BuildItem): boolean => available.item() === Item
    )[0];
  }

  /**
   * The ids of the enabled `Hold` rules whose criteria are met for what the city is building (`null` for a rule with
   *  no id), whatever its progress (civ-clone/web-renderer#959): a ruleset's own reasons, which a client can word, as
   *  `unavailable()`'s `refusedBy`. `check()` doesn't complete the item while any are given. A client combines it with
   *  `remaining()`: ids with something still to pay mean the item will wait once it is paid for, and ids with nothing
   *  left to pay mean it is waiting now. Empty while the city builds nothing, or nothing holds the item. Worked out
   *  when asked, so it is no part of a save and follows the city as it changes.
   */
  held(): (string | null)[] {
    if (this._building === null) {
      return [];
    }

    const item = this._building.item();

    return this._ruleRegistry
      .get(Hold)
      .filter((rule: Hold): boolean => rule.validate(this, item))
      .map((rule: Hold): string | null => rule.id());
  }

  progress(): BuildProgress {
    return this._progress;
  }

  /** The queued items, priced for the city as it is now, for a client to show their cost and turns. */
  queue(): BuildItem[] {
    return this.queued().map(
      (item: Buildable): BuildItem =>
        new BuildItem(item, this.city(), this._ruleRegistry)
    );
  }

  /** What the city builds after the current item, in order (civ-clone/web-renderer#774). */
  queued(): Buildable[] {
    // A build restored from a save made before the queue existed has no `_queue` at all.
    return this._queue ?? [];
  }

  /**
   * What the last move to the next queued item dropped, as the city could no longer build it. Empty again once
   * something is chosen for the city for its own sake: by its player, or by anything else that calls `build`.
   */
  queueDropped(): Buildable[] {
    return this._queueDropped ?? [];
  }

  remaining(): number {
    return this._cost.value() - this._progress.value();
  }

  /**
   * Prices what the city is building again, for the city as it is now. A `BuildCostModifier` may depend on who owns
   *  the city, so a city that changes hands re-prices its build (civ-clone/web-renderer#500).
   */
  reprice(): void {
    if (this._building === null) {
      return;
    }

    this._building = new BuildItem(
      this._building.item(),
      this.city(),
      this._ruleRegistry
    );

    this._cost.set(this._building.cost().value());
  }

  /** Moves the queued item at `from` to `to`, both clamped to the queue. A `from` past the end does nothing. */
  requeue(from: number, to: number): void {
    const queued = [...this.queued()],
      [moved] = queued.splice(Math.max(0, from), 1);

    if (moved === undefined) {
      return;
    }

    queued.splice(Math.max(0, Math.min(to, queued.length)), 0, moved);

    this._queue = queued;
  }

  revalidate(): void {
    if (this._building && !this.getAvailable(this._building.item())) {
      this.cancel('unavailable');
    }
  }

  setAuto(auto: boolean): void {
    this._auto = auto;
  }

  /** Records why the city is building nothing, for a reason the build itself doesn't know, such as a new city. */
  setCleared(
    reason: CityBuildClearedReason,
    item: Buildable | null = null
  ): void {
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
  protected advanceQueue(): void {
    const queued = [...this.queued()],
      dropped: Buildable[] = [];

    while (queued.length > 0) {
      const next = queued.shift()!;

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
  private settle(what: () => void): void {
    const already = settling.has(this);

    settling.add(this);

    try {
      what();
    } finally {
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
  protected queueAfterClearing(reason: CityBuildClearedReason): void {
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

export default CityBuild;
