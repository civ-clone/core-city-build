import {
  ConstructorRegistry,
  IConstructorRegistry,
} from '@civ-clone/core-registry/ConstructorRegistry';
export interface IAvailableCityBuildItemsRegistry
  extends IConstructorRegistry {}
export declare class AvailableCityBuildItemsRegistry
  extends ConstructorRegistry
  implements IAvailableCityBuildItemsRegistry {
  constructor();
}
export declare const instance: AvailableCityBuildItemsRegistry;
export default AvailableCityBuildItemsRegistry;
