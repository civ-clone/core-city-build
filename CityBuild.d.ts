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
export interface ICityBuild extends IDataObject {
  add(production: Yield): void;
  auto(): boolean;
  available(): BuildItem[];
  build(ItemToBuild: Buildable): void;
  building(): BuildItem | null;
  cancel(): void;
  check(): void;
  cost(): BuildProgress;
  getAvailable(Item: Buildable): BuildItem;
  progress(): BuildProgress;
  remaining(): number;
  reprice(): void;
  revalidate(): void;
  setAuto(auto: boolean): void;
  unavailable(): IUnavailableBuildItem[];
}
export declare class CityBuild extends DataObject implements ICityBuild {
  static readonly transient: string[];
  private _auto;
  private _availableCityBuildItemsRegistry;
  private _building;
  private _city;
  private _cost;
  private _progress;
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
  build(ItemToBuild: Buildable): void;
  building(): BuildItem | null;
  /** Stops building the current item, if any, and processes the `BuildingCancelled` rules. Progress is kept. */
  cancel(): void;
  check(): IDataObject | null;
  city(): City;
  cost(): BuildProgress;
  getAvailable(Item: Buildable): BuildItem;
  progress(): BuildProgress;
  remaining(): number;
  /**
   * Prices what the city is building again, for the city as it is now. A `BuildCostModifier` may depend on who owns
   *  the city, so a city that changes hands re-prices its build (civ-clone/web-renderer#500).
   */
  reprice(): void;
  revalidate(): void;
  setAuto(auto: boolean): void;
}
export default CityBuild;
