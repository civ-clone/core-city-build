import { Build, IBuildCriterion } from '../Rules/Build';
import AvailableCityBuildItemsRegistry from '../AvailableCityBuildItemsRegistry';
import BuildItem from '../BuildItem';
import BuildPriority from '../Rules/BuildPriority';
import Buildable from '../Buildable';
import CityBuild from '../CityBuild';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import autoBuild from '../lib/autoBuild';
import { buildCosts } from '../Rules/BuildCost';
import { expect } from 'chai';
import rankBuildItems from '../lib/rankBuildItems';
import { setUpCity } from '@civ-clone/civ1-city/tests/lib/setUpCity';

describe('autoBuild', (): void => {
  class Granary extends Buildable {}
  class Library extends Buildable {}
  class Marketplace extends Buildable {}
  class Palace extends Buildable {}

  const setUp = async (priorities: [typeof Buildable, number][]) => {
    const availableBuildItemsRegistry = new AvailableCityBuildItemsRegistry(),
      ruleRegistry = new RuleRegistry(),
      cityBuild = new CityBuild(
        await setUpCity(),
        availableBuildItemsRegistry,
        ruleRegistry
      );

    availableBuildItemsRegistry.register(Granary, Library, Marketplace, Palace);

    ruleRegistry.register(
      new Build(new Effect((): IBuildCriterion => new Criterion(() => true))),
      ...buildCosts([
        [Granary, 40],
        [Library, 60],
        [Marketplace, 60],
        [Palace, 100],
      ]),
      ...priorities.map(
        ([Item, score]) =>
          new BuildPriority(
            new Criterion(
              (cityBuild: CityBuild, BuildItem: typeof Buildable): boolean =>
                BuildItem === Item
            ),
            new Effect((): number => score)
          )
      )
    );

    return { cityBuild, ruleRegistry };
  };

  const items = (ranked: { buildItem: BuildItem }[]) =>
    ranked.map(({ buildItem }) => buildItem.item());

  it('should rank by the priorities added together, leaving out anything at 0 or below', async (): Promise<void> => {
    const { cityBuild, ruleRegistry } = await setUp([
      [Granary, 1],
      [Granary, 2],
      [Library, 2],
      [Marketplace, 0],
      [Palace, -1],
    ]);

    expect(items(rankBuildItems(cityBuild, ruleRegistry))).eql([
      Granary,
      Library,
    ]);
  });

  it('should break ties by cost, then by name', async (): Promise<void> => {
    const { cityBuild, ruleRegistry } = await setUp([
      [Granary, 1],
      [Library, 1],
      [Marketplace, 1],
    ]);

    expect(items(rankBuildItems(cityBuild, ruleRegistry))).eql([
      Granary,
      Library,
      Marketplace,
    ]);
  });

  it('should weigh each score and leave out what `include` excludes', async (): Promise<void> => {
    const { cityBuild, ruleRegistry } = await setUp([
      [Granary, 2],
      [Library, 1],
      [Marketplace, 1],
    ]);

    expect(
      items(
        rankBuildItems(
          cityBuild,
          ruleRegistry,
          (buildItem: BuildItem): boolean => buildItem.item() !== Granary,
          (buildItem: BuildItem): number =>
            buildItem.item() === Marketplace ? 3 : 1
        )
      )
    ).eql([Marketplace, Library]);
  });

  it('should build what ranks first in a city on Auto that is building nothing', async (): Promise<void> => {
    const { cityBuild, ruleRegistry } = await setUp([
      [Granary, 1],
      [Library, 2],
    ]);

    expect(autoBuild(cityBuild, ruleRegistry)).false;
    expect(cityBuild.building()).null;

    cityBuild.setAuto(true);

    expect(autoBuild(cityBuild, ruleRegistry)).true;
    expect(cityBuild.building()!.item()).equal(Library);

    expect(autoBuild(cityBuild, ruleRegistry)).false;
  });

  it('should leave a city on Auto building nothing when nothing ranks', async (): Promise<void> => {
    const { cityBuild, ruleRegistry } = await setUp([[Palace, 0]]);

    cityBuild.setAuto(true);

    expect(autoBuild(cityBuild, ruleRegistry)).false;
    expect(cityBuild.building()).null;
  });

  it('should not be on Auto when restored from a save made before Auto existed', (): void => {
    const restored = Object.create(CityBuild.prototype) as CityBuild;

    expect(restored.auto()).false;
  });
});
