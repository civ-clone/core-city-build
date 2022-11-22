import {
  EntityRegistry,
  IEntityRegistry,
} from '@civ-clone/core-registry/EntityRegistry';
import { IBuildable } from './Buildable';
export declare class AvailableCityBuildItemsRegistry
  extends EntityRegistry<IBuildable>
  implements IEntityRegistry<IBuildable>
{
  constructor();
  accepts(entity: IBuildable): boolean;
}
export declare const instance: AvailableCityBuildItemsRegistry;
export default AvailableCityBuildItemsRegistry;
