import { Build, IBuildCriterion } from '../Rules/Build';
import { expect, spy, use } from 'chai';
import AvailableCityBuildItemsRegistry from '../AvailableCityBuildItemsRegistry';
import { BuildProgress } from '../Yields';
import Buildable from '../Buildable';
import BuildCategory from '../Rules/BuildCategory';
import BuildingComplete from '../Rules/BulidingComplete';
import BuildingHeld from '../Rules/BuildingHeld';
import BuildOverflow from '../Rules/BuildOverflow';
import CityBuild from '../CityBuild';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import Hold from '../Rules/Hold';
import ProductionChanged from '../Rules/ProductionChanged';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import { buildCategory } from '../lib/buildCategory';
import { buildCost } from '../Rules/BuildCost';
import { setUpCity } from '@civ-clone/civ1-city/tests/lib/setUpCity';
import * as spies from 'chai-spies';

use(spies);

class Item extends Buildable {
  public static build() {
    return new this();
  }
}
class Warriors extends Item {}
class Settlers extends Item {}
class Temple extends Item {}
class Pyramids extends Item {}
class Coinage extends Item {}

const setUp = async (...rules: unknown[]) => {
  const ruleRegistry = new RuleRegistry(),
    availableBuildItemsRegistry = new AvailableCityBuildItemsRegistry(),
    cityBuild = new CityBuild(
      await setUpCity(),
      availableBuildItemsRegistry,
      ruleRegistry
    ),
    completed = spy();

  ruleRegistry.register(
    new Build(new Effect((): IBuildCriterion => new Criterion(() => true))),
    ...buildCost(Warriors, 10),
    ...buildCost(Settlers, 30),
    ...buildCost(Temple, 40),
    ...buildCost(Pyramids, 200),
    new BuildingComplete(new Effect(completed)),
    ...(rules as any[])
  );

  availableBuildItemsRegistry.register(Warriors, Settlers, Temple, Pyramids);

  return { availableBuildItemsRegistry, cityBuild, completed, ruleRegistry };
};

// Civ2's change penalty, as a ruleset would register it: half the progress, rounded in the build's favour, is lost
//  on a change to an item of another category.
const categories = new Map<Buildable, string>([
    [Warriors, 'unit'],
    [Settlers, 'unit'],
    [Temple, 'improvement'],
    [Pyramids, 'wonder'],
  ]),
  categoryRule = () =>
    new BuildCategory(
      new Effect((item: typeof Buildable): string => categories.get(item)!)
    ),
  penaltyRule = (ruleRegistry: () => RuleRegistry) =>
    new ProductionChanged(
      new Effect(
        (
          cityBuild: CityBuild,
          from: typeof Buildable | null,
          to: typeof Buildable,
          progress: number
        ): number =>
          from === null ||
          buildCategory(from, ruleRegistry()) ===
            buildCategory(to, ruleRegistry())
            ? progress
            : progress - Math.floor((50 * progress) / 100)
      )
    );

describe('CityBuild seams', (): void => {
  describe('with no rules registered', (): void => {
    it('starts again from 0 once an item is completed', async (): Promise<void> => {
      const { cityBuild } = await setUp();

      cityBuild.build(Warriors);
      cityBuild.add(new BuildProgress(13));

      expect(cityBuild.check()).instanceof(Warriors);
      expect(cityBuild.progress().values()).eql([[0, '']]);
    });

    it('keeps the progress on a change, and keeps nothing else', async (): Promise<void> => {
      const { cityBuild } = await setUp(),
        keys = Object.keys(cityBuild);

      cityBuild.build(Warriors);
      cityBuild.add(new BuildProgress(13));
      cityBuild.build(Temple);
      cityBuild.build(Pyramids);

      expect(cityBuild.progress().value()).equal(13);
      expect(cityBuild.progress().values()).eql([
        [0, 'initial'],
        [13, ''],
      ]);
      expect(Object.keys(cityBuild)).eql(keys);
      expect(keys).not.include('_changedFrom');
    });

    it('has no category for an item', async (): Promise<void> => {
      const { ruleRegistry } = await setUp();

      expect(buildCategory(Warriors, ruleRegistry)).null;
    });
  });

  describe('BuildOverflow', (): void => {
    it('starts the next item with what the rule keeps', async (): Promise<void> => {
      const seen: unknown[] = [],
        { cityBuild } = await setUp(
          new BuildOverflow(
            new Effect(
              (
                cityBuild: CityBuild,
                item: typeof Buildable,
                progress: number,
                cost: number
              ): number => {
                seen.push(item, progress, cost);

                return progress - cost;
              }
            )
          )
        );

      cityBuild.build(Warriors);
      cityBuild.add(new BuildProgress(13));

      expect(cityBuild.check()).instanceof(Warriors);
      expect(seen).eql([Warriors, 13, 10]);
      expect(cityBuild.progress().value()).equal(3);
    });

    it('starts again from 0 for a rule that answers nothing', async (): Promise<void> => {
      const { cityBuild } = await setUp(
        new BuildOverflow(new Effect((): void => undefined))
      );

      cityBuild.build(Warriors);
      cityBuild.add(new BuildProgress(13));
      cityBuild.check();

      expect(cityBuild.progress().value()).equal(0);
    });
  });

  describe('BuildCategory', (): void => {
    it("gives the rule's category", async (): Promise<void> => {
      const { ruleRegistry } = await setUp(categoryRule());

      expect(buildCategory(Pyramids, ruleRegistry)).equal('wonder');
      expect(buildCategory(Settlers, ruleRegistry)).equal('unit');
    });
  });

  describe('ProductionChanged', (): void => {
    const setUpPenalty = async () => {
      let registry: RuleRegistry | null = null;

      const setup = await setUp(
        categoryRule(),
        penaltyRule(() => registry!)
      );

      registry = setup.ruleRegistry;

      setup.cityBuild.build(Warriors);
      setup.cityBuild.add(new BuildProgress(15));

      return setup;
    };

    it('keeps what the rule answers on a change', async (): Promise<void> => {
      const { cityBuild } = await setUpPenalty();

      cityBuild.build(Settlers);
      expect(cityBuild.progress().value()).equal(15);

      cityBuild.build(Temple);
      expect(cityBuild.progress().value()).equal(8);
    });

    it('asks from where the turn started, so changing back gives the progress back', async (): Promise<void> => {
      const { cityBuild } = await setUpPenalty();

      cityBuild.build(Temple);
      expect(cityBuild.progress().value()).equal(8);

      // From the Warriors' 15, not the Temple's 8.
      cityBuild.build(Pyramids);
      expect(cityBuild.progress().value()).equal(8);

      cityBuild.build(Settlers);
      expect(cityBuild.progress().value()).equal(15);
      expect(Object.keys(cityBuild)).not.include('_changedFrom');

      cityBuild.build(Temple);
      expect(cityBuild.progress().value()).equal(8);
    });

    it("forgets the turn's start once production goes in or the build is checked", async (): Promise<void> => {
      const { cityBuild } = await setUpPenalty();

      cityBuild.build(Temple);
      expect(Object.keys(cityBuild)).include('_changedFrom');

      cityBuild.add(new BuildProgress(2));
      expect(Object.keys(cityBuild)).not.include('_changedFrom');

      // 10 on the Temple now: back to a unit loses half of it.
      cityBuild.build(Warriors);
      expect(cityBuild.progress().value()).equal(5);

      cityBuild.check();
      expect(Object.keys(cityBuild)).not.include('_changedFrom');

      cityBuild.build(Temple);
      expect(cityBuild.progress().value()).equal(3);
    });

    it('is not asked when the same item is chosen again, or for the next queued item', async (): Promise<void> => {
      const asked = spy(),
        { cityBuild } = await setUp(new ProductionChanged(new Effect(asked)));

      cityBuild.build(Warriors);
      expect(asked).called.once;

      cityBuild.build(Warriors);
      expect(asked).called.once;

      cityBuild.enqueue(Temple);
      cityBuild.add(new BuildProgress(10));
      cityBuild.check();

      expect(cityBuild.building()!.item()).equal(Temple);
      expect(asked).called.once;
    });

    it('keeps the progress for a rule that answers nothing', async (): Promise<void> => {
      const { cityBuild } = await setUp(
        new ProductionChanged(new Effect((): void => undefined))
      );

      cityBuild.build(Warriors);
      cityBuild.add(new BuildProgress(15));
      cityBuild.build(Temple);

      expect(cityBuild.progress().value()).equal(15);
      expect(Object.keys(cityBuild)).not.include('_changedFrom');
    });
  });

  // Capitalization needs no seam of its own: an item that a `Hold` rule always holds never completes, and costing
  //  nothing it is "paid for" at every check, so a `BuildingHeld` rule turns the turn's progress into something else.
  describe('an item that never completes', (): void => {
    it("can turn each turn's progress into something else, with a `Hold` and a `BuildingHeld` rule", async (): Promise<void> => {
      const converted: number[] = [],
        { availableBuildItemsRegistry, cityBuild, completed } = await setUp(
          ...buildCost(Coinage, 0),
          new Hold(
            'test:city/hold/coinage',
            new Criterion(
              (cityBuild: CityBuild, item: typeof Buildable): boolean =>
                item === Coinage
            )
          ),
          new BuildingHeld(
            new Criterion(
              (cityBuild: CityBuild, item: typeof Buildable): boolean =>
                item === Coinage
            ),
            new Effect((cityBuild: CityBuild): void => {
              converted.push(cityBuild.progress().value());

              cityBuild.progress().set(0);
            })
          )
        );

      availableBuildItemsRegistry.register(Coinage);

      cityBuild.build(Coinage);

      [4, 7, 0].forEach((production) => {
        cityBuild.add(new BuildProgress(production));

        expect(cityBuild.check()).null;
      });

      expect(converted).eql([4, 7, 0]);
      expect(completed).not.called;
      expect(cityBuild.building()!.item()).equal(Coinage);
      expect(cityBuild.progress().value()).equal(0);
    });
  });
});
