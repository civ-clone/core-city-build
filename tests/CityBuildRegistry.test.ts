import AvailableCityBuildItemsRegistry from '../AvailableCityBuildItemsRegistry';
import CityBuild from '../CityBuild';
import CityBuildRegistry from '../CityBuildRegistry';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import { expect } from 'chai';
import setUpCity from '@civ-clone/core-city/tests/lib/setUpCity';

describe('CityBuildRegistry', (): void => {
  it("should return each city's own build", async (): Promise<void> => {
    const ruleRegistry = new RuleRegistry(),
      available = new AvailableCityBuildItemsRegistry(),
      registry = new CityBuildRegistry(),
      city = await setUpCity('city', ruleRegistry),
      otherCity = await setUpCity('city', ruleRegistry),
      cityBuild = new CityBuild(city, available, ruleRegistry),
      otherCityBuild = new CityBuild(otherCity, available, ruleRegistry);

    registry.register(cityBuild, otherCityBuild);

    expect(registry.getByCity(city)).to.equal(cityBuild);
    expect(registry.getByCity(otherCity)).to.equal(otherCityBuild);
  });

  it('should throw for a city with no build, or one whose build was unregistered', async (): Promise<void> => {
    const ruleRegistry = new RuleRegistry(),
      registry = new CityBuildRegistry(),
      city = await setUpCity('city', ruleRegistry),
      cityBuild = new CityBuild(
        city,
        new AvailableCityBuildItemsRegistry(),
        ruleRegistry
      );

    expect((): CityBuild => registry.getByCity(city)).to.throw(TypeError);

    registry.register(cityBuild);
    registry.unregister(cityBuild);

    expect((): CityBuild => registry.getByCity(city)).to.throw(TypeError);
  });

  it('should throw for a city with two builds', async (): Promise<void> => {
    const ruleRegistry = new RuleRegistry(),
      available = new AvailableCityBuildItemsRegistry(),
      registry = new CityBuildRegistry(),
      city = await setUpCity('city', ruleRegistry);

    registry.register(
      new CityBuild(city, available, ruleRegistry),
      new CityBuild(city, available, ruleRegistry)
    );

    expect((): CityBuild => registry.getByCity(city)).to.throw(TypeError);
  });
});
