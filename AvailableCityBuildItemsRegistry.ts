import {
  ConstructorRegistry,
  IConstructorRegistry,
} from '@civ-clone/core-registry/ConstructorRegistry';
import { IConstructor } from '@civ-clone/core-registry/Registry';

// TODO: this should be more specific
// export interface IAvailableCityBuildItemsRegistry extends IConstructorRegistry<IBuildItem> {}
export interface IAvailableCityBuildItemsRegistry
  extends IConstructorRegistry {}

// export class AvailableCityBuildItemsRegistry extends ConstructorRegistry<IBuildItem> implements IAvailableCityBuildItemsRegistry {
export class AvailableCityBuildItemsRegistry
  extends ConstructorRegistry
  implements IAvailableCityBuildItemsRegistry {
  constructor() {
    // super(Unit, CityImprovement);
    super(<IConstructor>Function);
  }
}

export const instance: AvailableCityBuildItemsRegistry = new AvailableCityBuildItemsRegistry();

export default AvailableCityBuildItemsRegistry;
