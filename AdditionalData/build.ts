import {
  CityBuildRegistry,
  instance as cityBuildRegistryInstance,
} from '../CityBuildRegistry';
import AdditionalData from '@civ-clone/core-data-object/AdditionalData';
import City from '@civ-clone/core-city/City';

export const getAdditionalData = (
  cityBuildRegistry: CityBuildRegistry = cityBuildRegistryInstance
) => [
  new AdditionalData(City, 'build', (city: City) =>
    cityBuildRegistry.getByCity(city)
  ),
];

export default getAdditionalData;
