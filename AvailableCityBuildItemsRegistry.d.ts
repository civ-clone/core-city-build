import {
  ConstructorRegistry,
  IConstructorRegistry,
} from '@civ-clone/core-registry/ConstructorRegistry';
import Buildable from './Buildable';
export declare class AvailableCityBuildItemsRegistry
  extends ConstructorRegistry<Buildable>
  implements IConstructorRegistry<Buildable>
{
  constructor();
}
export declare const instance: AvailableCityBuildItemsRegistry;
export default AvailableCityBuildItemsRegistry;
