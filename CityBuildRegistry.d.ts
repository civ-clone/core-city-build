import {
  EntityRegistry,
  IEntityRegistry,
} from '@civ-clone/core-registry/EntityRegistry';
import City from '@civ-clone/core-city/City';
import CityBuild from './CityBuild';
export interface ICityBuildRegistry extends IEntityRegistry<CityBuild> {
  getByCity(city: City): CityBuild;
}
export declare class CityBuildRegistry
  extends EntityRegistry<CityBuild>
  implements ICityBuildRegistry
{
  constructor();
  getByCity(city: City): CityBuild;
}
export declare const instance: CityBuildRegistry;
export default CityBuildRegistry;
