import { AvailableCityBuildItemsRegistry } from './AvailableCityBuildItemsRegistry';
import { ICompletedBuildItem } from './Rules/BulidingComplete';
import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import { BuildProgress } from './Yields';
import City from '@civ-clone/core-city/City';
import { IConstructor } from '@civ-clone/core-registry/Registry';
import Yield from '@civ-clone/core-yield/Yield';
export interface ICityBuild {
  add(production: Yield): void;
  available(): IConstructor[];
  build(BuildItem: IConstructor): void;
  building(): IConstructor | null;
  check(): void;
  cost(): BuildProgress;
  progress(): BuildProgress;
  remaining(): number;
  revalidate(): void;
}
export declare class CityBuild implements ICityBuild {
  #private;
  constructor(
    city: City,
    availableCityBuildItemsRegistry?: AvailableCityBuildItemsRegistry,
    ruleRegistry?: RuleRegistry
  );
  add(production: Yield): void;
  available(): IConstructor[];
  build(BuildItem: IConstructor): void;
  building(): IConstructor | null;
  check(): ICompletedBuildItem | null;
  city(): City;
  cost(): BuildProgress;
  progress(): BuildProgress;
  remaining(): number;
  revalidate(): void;
}
export default CityBuild;
