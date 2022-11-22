import {
  EntityRegistry,
  IEntityRegistry,
} from '@civ-clone/core-registry/EntityRegistry';
import { IBuildable } from './Buildable';

export class AvailableCityBuildItemsRegistry
  extends EntityRegistry<IBuildable>
  implements IEntityRegistry<IBuildable>
{
  constructor() {
    // All `Buildable`s are `Function`s so this is sufficient although less than ideal
    // @ts-ignore
    super(Function);
  }

  accepts(entity: IBuildable): boolean {
    return 'build' in entity;
  }
}

export const instance: AvailableCityBuildItemsRegistry =
  new AvailableCityBuildItemsRegistry();

export default AvailableCityBuildItemsRegistry;
