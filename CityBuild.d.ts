import { AvailableCityBuildItemsRegistry } from './AvailableCityBuildItemsRegistry';
import {
  DataObject,
  IDataObject,
} from '@civ-clone/core-data-object/DataObject';
import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import BuildItem from './BuildItem';
import { BuildProgress } from './Yields';
import { IBuildable as Buildable } from './Buildable';
import City from '@civ-clone/core-city/City';
import Yield from '@civ-clone/core-yield/Yield';
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
export declare class CityBuild extends DataObject implements ICityBuild {
  static readonly transient: string[];
  private _auto;
  private _availableCityBuildItemsRegistry;
  private _building;
  private _city;
  private _cleared;
  private _cost;
  private _progress;
  private _queue;
  private _queueDropped;
  private _ruleRegistry;
  constructor(
    city: City,
    availableCityBuildItemsRegistry?: AvailableCityBuildItemsRegistry,
    ruleRegistry?: RuleRegistry
  );
  add(production: Yield): void;
  auto(): boolean;
  available(): BuildItem[];
  /**
   * Every item `available()` leaves out, with the ids of the rules that refused it, for saying why a city can't build
   * something (civ-clone/web-renderer#37): a ruleset's requirement entries share their rules' ids, so an id names what
   * is missing. It asks the same rules `available()` does; `available()` itself doesn't use it, as it can stop at the
   * first refusal. Unlike `available()`, it runs every applicable rule for an item, so a rule must not rely on an earlier
   * one having refused first.
   */
  unavailable(): IUnavailableBuildItem[];
  /**
   * Starts building `ItemToBuild`. Chosen by the player while it's first in the queue, it's that queued item: it leaves
   *  the queue rather than being built twice.
   */
  choose(ItemToBuild: Buildable): void;
  build(ItemToBuild: Buildable): void;
  building(): BuildItem | null;
  /**
   * Stops building the current item, if any, and processes the `BuildingCancelled` rules. Progress is kept. `reason` is
   *  what `cleared()` gives, set before the rules run, so a rule that chooses another build clears it again.
   */
  cancel(reason?: CityBuildClearedReason): void;
  /**
   * Completes the item being built once its progress has reached the cost and no `Hold` rule holds it (`held()` is
   *  empty), and gives what was built. Otherwise gives `null`, and changes nothing: a held item stays chosen, and its
   *  progress goes on adding up.
   */
  check(): IDataObject | null;
  city(): City;
  /** Why the city is building nothing, or `null` while it builds something, or when that isn't known (an older save). */
  cleared(): ICityBuildCleared | null;
  /** Empties the queue. */
  clearQueue(): void;
  cost(): BuildProgress;
  /** Removes the queued item at `index`. A negative one is the first; one past the end does nothing. */
  dequeue(index: number): void;
  /**
   * Lines `Item` up to build after the current item: at the end, or at `at`. Only what the city can build now; one it
   *  can't by the time it's reached is dropped then (`queueDropped`).
   */
  enqueue(Item: Buildable, at?: number): void;
  /**
   * A build loaded from a save has the keys it had when it was saved: one made before the queue existed would never
   *  send it (civ-clone/web-renderer#774). Adds those it's missing.
   */
  onHydrated(): void;
  getAvailable(Item: Buildable): BuildItem;
  /**
   * The ids of the enabled `Hold` rules whose criteria are met for what the city is building (`null` for a rule with
   *  no id), whatever its progress (civ-clone/web-renderer#959): a ruleset's own reasons, which a client can word, as
   *  `unavailable()`'s `refusedBy`. `check()` doesn't complete the item while any are given. A client combines it with
   *  `remaining()`: ids with something still to pay mean the item will wait once it is paid for, and ids with nothing
   *  left to pay mean it is waiting now. Empty while the city builds nothing, or nothing holds the item. Worked out
   *  when asked, so it is no part of a save and follows the city as it changes.
   */
  held(): (string | null)[];
  progress(): BuildProgress;
  /** The queued items, priced for the city as it is now, for a client to show their cost and turns. */
  queue(): BuildItem[];
  /** What the city builds after the current item, in order (civ-clone/web-renderer#774). */
  queued(): Buildable[];
  /**
   * What the last move to the next queued item dropped, as the city could no longer build it. Empty again once
   * something is chosen for the city for its own sake: by its player, or by anything else that calls `build`.
   */
  queueDropped(): Buildable[];
  remaining(): number;
  /**
   * Prices what the city is building again, for the city as it is now. A `BuildCostModifier` may depend on who owns
   *  the city, so a city that changes hands re-prices its build (civ-clone/web-renderer#500).
   */
  reprice(): void;
  /** Moves the queued item at `from` to `to`, both clamped to the queue. A `from` past the end does nothing. */
  requeue(from: number, to: number): void;
  revalidate(): void;
  setAuto(auto: boolean): void;
  /** Records why the city is building nothing, for a reason the build itself doesn't know, such as a new city. */
  setCleared(reason: CityBuildClearedReason, item?: Buildable | null): void;
  /**
   * Starts the first queued item the city can still build, dropping any before it that it can't (`queueDropped`).
   *  Leaves the city building nothing when none is left.
   */
  protected advanceQueue(): void;
  private settle;
  /**
   * What the queue does when the build is cleared for `reason`: a city that has changed hands drops its previous
   *  owner's queue. Otherwise it's kept: a city that can no longer build its item (a rival finished the Wonder) is left
   *  for its player to choose, and told why, as without a queue, and the queue goes on after whatever they choose. A
   *  city on Auto isn't asked, so it goes on to its queue, before Auto chooses for it.
   */
  protected queueAfterClearing(reason: CityBuildClearedReason): void;
}
export default CityBuild;
