import { expect, use, spy } from 'chai';
import { Build, IBuildCriterion } from '../Rules/Build';
import AvailableCityBuildItemsRegistry from '../AvailableCityBuildItemsRegistry';
import { BuildProgress } from '../Yields';
import Buildable from '../Buildable';
import BuildingCancelled from '../Rules/BulidingCancelled';
import BuildingComplete from '../Rules/BulidingComplete';
import CityBuild from '../CityBuild';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import { buildCost } from '../Rules/BuildCost';
import { setUpCity } from '@civ-clone/civ1-city/tests/lib/setUpCity';
import * as spies from 'chai-spies';

use(spies);

describe('CityBuild', (): void => {
  class Unit extends Buildable {
    public static build() {
      return new Unit();
    }
  }

  it('should have expected initial state', async (): Promise<void> => {
    const cityBuild = new CityBuild(await setUpCity());

    expect(cityBuild.progress().value()).equal(0);
    expect(cityBuild.cost().value()).equal(Infinity);
    expect(cityBuild.building()).null;
  });

  it('should correctly use `Rule`s to determine the cost and availability of BuildItems', async (): Promise<void> => {
    const availableBuildItemsRegistry = new AvailableCityBuildItemsRegistry(),
      ruleRegistry = new RuleRegistry(),
      cityBuild = new CityBuild(
        await setUpCity(),
        availableBuildItemsRegistry,
        ruleRegistry
      ),
      effectSpy = spy();

    ruleRegistry.register(
      new Build(new Effect((): IBuildCriterion => new Criterion(() => true))),
      new BuildingCancelled(new Effect(effectSpy))
    );

    expect(() => cityBuild.build(Unit as typeof Buildable)).throw(TypeError);

    availableBuildItemsRegistry.register(Unit);

    expect(() => cityBuild.build(Unit as typeof Buildable)).not.throw(
      TypeError
    );
    expect(cityBuild.cost().value()).not.finite;
    expect(cityBuild.building()!.item()).equal(Unit);

    availableBuildItemsRegistry.unregister(Unit);

    cityBuild.revalidate();

    expect(effectSpy).called.once;
  });

  it('should accept `BuildProgress` until the `cost` is reached', async (): Promise<void> => {
    const availableBuildItemsRegistry = new AvailableCityBuildItemsRegistry(),
      ruleRegistry = new RuleRegistry(),
      cityBuild = new CityBuild(
        await setUpCity(),
        availableBuildItemsRegistry,
        ruleRegistry
      ),
      effectSpy = spy();

    ruleRegistry.register(
      new Build(new Effect((): IBuildCriterion => new Criterion(() => true))),
      ...buildCost(Unit as typeof Buildable, 10),
      new BuildingComplete(new Effect(effectSpy))
    );

    availableBuildItemsRegistry.register(Unit);

    cityBuild.build(Unit as typeof Buildable);

    expect(cityBuild.cost().value()).equal(10);

    expect(effectSpy).not.called.once;

    cityBuild.add(new BuildProgress(5));
    cityBuild.check();

    expect(effectSpy).not.called;

    expect(cityBuild.remaining()).equal(5);

    cityBuild.add(new BuildProgress(5));
    cityBuild.check();

    expect(effectSpy).called.once;
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
      new Build(new Effect(() => 0 as unknown as IBuildCriterion))
    );

    availableBuildItemsRegistry.register(Unit);

    expect(() => cityBuild.build(Unit as typeof Buildable)).throw(TypeError);
  });

  it("should remove an item that's no longer available on `revalidate()`", async (): Promise<void> => {
    const availableBuildItemsRegistry = new AvailableCityBuildItemsRegistry(),
      ruleRegistry = new RuleRegistry(),
      cityBuild = new CityBuild(
        await setUpCity(),
        availableBuildItemsRegistry,
        ruleRegistry
      );

    ruleRegistry.register(
      new Build(new Effect((): IBuildCriterion => new Criterion(() => true))),
      ...buildCost(Unit as typeof Buildable, 10)
    );

    availableBuildItemsRegistry.register(Unit);

    cityBuild.build(Unit as typeof Buildable);

    expect(cityBuild.building()!.item()).equal(Unit);

    availableBuildItemsRegistry.unregister(Unit);

    cityBuild.revalidate();

    expect(cityBuild.building()).null;
  });
});
