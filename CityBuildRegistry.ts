import {
  EntityRegistry,
  IEntityRegistry,
} from '@civ-clone/core-registry/EntityRegistry';
import City from '@civ-clone/core-city/City';
import CityBuild from './CityBuild';

export interface ICityBuildRegistry extends IEntityRegistry<CityBuild> {
  getByCity(city: City): CityBuild;
}

export class CityBuildRegistry
  extends EntityRegistry<CityBuild>
  implements ICityBuildRegistry
{
  constructor() {
    super(CityBuild);
  }

  getByCity(city: City): CityBuild {
    const cityBuilds = this.getBy('city', city);

    if (cityBuilds.length !== 1) {
      throw new TypeError('Wrong number of entities returned.');
    }

    return cityBuilds[0];
  }
}

export const instance: CityBuildRegistry = new CityBuildRegistry();

export default CityBuildRegistry;
