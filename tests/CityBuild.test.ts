import { Build, IBuildCriterion } from '../Rules/Build';
import AvailableCityBuildItemsRegistry from '../AvailableCityBuildItemsRegistry';
import { BuildProgress } from '../Yields';
import BuildingCancelled from '../Rules/BulidingCancelled';
import BuildingComplete from '../Rules/BulidingComplete';
import CityBuild from '../CityBuild';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import Unit from '@civ-clone/core-unit/Unit';
import { buildCost } from '../Rules/BuildCost';
import { setUpCity } from '@civ-clone/civ1-city/tests/lib/setUpCity';
import * as chai from 'chai';
import * as spies from 'chai-spies';

const { expect, use } = chai;

use(spies);

describe('CityBuild', (): void => {
  it('should have expected initial state', (): void => {
    const cityBuild = new CityBuild(setUpCity());

    expect(cityBuild.progress().value()).to.equal(0);
    expect(cityBuild.cost().value()).to.equal(Infinity);
    expect(cityBuild.building()).to.null;
  });

  it('should correctly use `Rule`s to determine the cost and availability of BuildItems', async (): Promise<void> => {
    const availableBuildItemsRegistry = new AvailableCityBuildItemsRegistry(),
      ruleRegistry = new RuleRegistry(),
      cityBuild = new CityBuild(
        await setUpCity(),
        availableBuildItemsRegistry,
        ruleRegistry
      ),
      spy = chai.spy();

    ruleRegistry.register(
      new Build(new Effect((): IBuildCriterion => new Criterion(() => true))),
      new BuildingCancelled(new Effect(spy))
    );

    expect(() => cityBuild.build(Unit)).to.throw(TypeError);

    availableBuildItemsRegistry.register(Unit);

    expect(() => cityBuild.build(Unit)).to.not.throw(TypeError);
    expect(cityBuild.cost().value()).to.NaN;
    expect(cityBuild.building()).to.equal(Unit);

    availableBuildItemsRegistry.unregister(Unit);

    cityBuild.revalidate();

    expect(spy).to.called.once;
  });

  it('should accept `BuildProgress` until the `cost` is reached', async (): Promise<void> => {
    const availableBuildItemsRegistry = new AvailableCityBuildItemsRegistry(),
      ruleRegistry = new RuleRegistry(),
      cityBuild = new CityBuild(
        await setUpCity(),
        availableBuildItemsRegistry,
        ruleRegistry
      ),
      spy = chai.spy();

    ruleRegistry.register(
      new Build(new Effect((): IBuildCriterion => new Criterion(() => true))),
      ...buildCost(Unit, 10),
      new BuildingComplete(new Effect(spy))
    );

    availableBuildItemsRegistry.register(Unit);

    cityBuild.build(Unit);

    expect(cityBuild.cost().value()).to.equal(10);

    expect(spy).to.not.called.once;

    cityBuild.add(new BuildProgress(5));
    cityBuild.check();

    expect(spy).to.not.called.once;

    expect(cityBuild.remaining()).to.equal(5);

    cityBuild.add(new BuildProgress(5));
    cityBuild.check();

    expect(spy).to.called.once;
  });

  it("should throw and error if a `Build` `Rule` doesn't return a `Criterion`", async (): Promise<void> => {
    const availableBuildItemsRegistry = new AvailableCityBuildItemsRegistry(),
      ruleRegistry = new RuleRegistry(),
      cityBuild = new CityBuild(
        await setUpCity(),
        availableBuildItemsRegistry,
        ruleRegistry
      );

    ruleRegistry.register(
      new Build(new Effect(() => (0 as unknown) as IBuildCriterion))
    );

    availableBuildItemsRegistry.register(Unit);

    expect(() => cityBuild.build(Unit)).to.throw(TypeError);
  });
});
