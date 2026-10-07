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
  // A build's city is set when it's made and never changes, so the index can't go stale and needs no `reindex`. Scanning
  //  every build for each lookup was 7% of a late-game turn (civ-clone/web-renderer#308).
  private _byCity = this.index(
    (cityBuild: CityBuild): City => cityBuild.city()
  );

  constructor() {
    super(CityBuild);
  }

  getByCity(city: City): CityBuild {
    const cityBuilds = this._byCity.get(city);

    if (cityBuilds.length !== 1) {
      throw new TypeError('Wrong number of entities returned.');
    }

    return cityBuilds[0];
  }
}

export const instance: CityBuildRegistry = new CityBuildRegistry();

export default CityBuildRegistry;
