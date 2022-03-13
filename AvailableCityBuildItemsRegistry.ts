import {
  ConstructorRegistry,
  IConstructorRegistry,
} from '@civ-clone/core-registry/ConstructorRegistry';
import Buildable from './Buildable';

export class AvailableCityBuildItemsRegistry
  extends ConstructorRegistry<Buildable>
  implements IConstructorRegistry<Buildable>
{
  constructor() {
    super(Buildable);
  }
}

export const instance: AvailableCityBuildItemsRegistry =
  new AvailableCityBuildItemsRegistry();

export default AvailableCityBuildItemsRegistry;
