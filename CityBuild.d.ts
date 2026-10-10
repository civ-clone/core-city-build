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
export interface ICityBuild extends IDataObject {
  add(production: Yield): void;
  auto(): boolean;
  available(): BuildItem[];
  build(ItemToBuild: Buildable): void;
  building(): BuildItem | null;
  check(): void;
  cost(): BuildProgress;
  getAvailable(Item: Buildable): BuildItem;
  progress(): BuildProgress;
  remaining(): number;
  revalidate(): void;
  setAuto(auto: boolean): void;
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
  build(ItemToBuild: Buildable): void;
  building(): BuildItem | null;
  check(): IDataObject | null;
  city(): City;
  cost(): BuildProgress;
  getAvailable(Item: Buildable): BuildItem;
  progress(): BuildProgress;
  remaining(): number;
  revalidate(): void;
  setAuto(auto: boolean): void;
}
export default CityBuild;
