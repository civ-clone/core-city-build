import { AvailableCityBuildItemsRegistry } from './AvailableCityBuildItemsRegistry';
import {
  DataObject,
  IDataObject,
} from '@civ-clone/core-data-object/DataObject';
import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import BuildItem from './BuildItem';
import { BuildProgress } from './Yields';
import Buildable from './Buildable';
import City from '@civ-clone/core-city/City';
import Yield from '@civ-clone/core-yield/Yield';
export interface ICityBuild extends IDataObject {
  add(production: Yield): void;
  available(): BuildItem[];
  build(ItemToBuild: typeof Buildable): void;
  building(): BuildItem | null;
  check(): void;
  cost(): BuildProgress;
  getAvailable(Item: typeof Buildable): BuildItem;
  progress(): BuildProgress;
  remaining(): number;
  revalidate(): void;
}
export declare class CityBuild extends DataObject implements ICityBuild {
  #private;
  constructor(
    city: City,
    availableCityBuildItemsRegistry?: AvailableCityBuildItemsRegistry,
    ruleRegistry?: RuleRegistry
  );
  add(production: Yield): void;
  available(): BuildItem[];
  build(ItemToBuild: typeof Buildable): void;
  building(): BuildItem | null;
  check(): Buildable | null;
  city(): City;
  cost(): BuildProgress;
  getAvailable(Item: typeof Buildable): BuildItem;
  progress(): BuildProgress;
  remaining(): number;
  revalidate(): void;
}
export default CityBuild;
