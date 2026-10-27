import { Build, IBuildCriterion } from '../Rules/Build';
import { Horseman, Spearman, Warrior } from '@civ-clone/civ1-unit/Units';
import {
  Barracks,
  Granary,
  Temple,
} from '@civ-clone/civ1-city-improvement/CityImprovements';
import { expect, use, spy } from 'chai';
import AvailableCityBuildItemsRegistry from '../AvailableCityBuildItemsRegistry';
import { BuildProgress } from '../Yields';
import Buildable from '../Buildable';
import BuildingCancelled from '../Rules/BulidingCancelled';
import BuildCostModifier from '../Rules/BuildCostModifier';
import BuildingComplete from '../Rules/BulidingComplete';
import CityBuild from '../CityBuild';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import Priority from '@civ-clone/core-rule/Priority';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import { buildCost, buildCosts } from '../Rules/BuildCost';
import { setUpCity } from '@civ-clone/civ1-city/tests/lib/setUpCity';
import * as spies from 'chai-spies';

use(spies);

describe('CityBuild', (): void => {
  class Unit extends Buildable {
    public static build() {
      return new Unit();
    }
  }

  it('should be possible to register well defined items', async () => {
    const availableBuildItemsRegistry = new AvailableCityBuildItemsRegistry();

    availableBuildItemsRegistry.register(
      Horseman,
      Spearman,
      Warrior,
      Barracks,
      Granary,
      Temple
    );
  });

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

    expect(() => cityBuild.build(Unit)).throw(TypeError);

    availableBuildItemsRegistry.register(Unit);

    expect(() => cityBuild.build(Unit)).not.throw(TypeError);
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
      ...buildCost(Unit, 10),
      new BuildingComplete(new Effect(effectSpy))
    );

    availableBuildItemsRegistry.register(Unit);

    cityBuild.build(Unit);

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

  it('should apply each `BuildCostModifier` in turn to the cost', async (): Promise<void> => {
    const availableBuildItemsRegistry = new AvailableCityBuildItemsRegistry(),
      ruleRegistry = new RuleRegistry(),
      city = await setUpCity(),
      cityBuild = new CityBuild(
        city,
        availableBuildItemsRegistry,
        ruleRegistry
      );

    ruleRegistry.register(
      new Build(new Effect((): IBuildCriterion => new Criterion(() => true))),
      ...buildCost(Unit, 10),
      new BuildCostModifier(
        new Effect((buildItem, buildCity, cost: number): number => cost * 2)
      ),
      new BuildCostModifier(
        new Criterion((buildItem, buildCity, cost: number) => cost === 20),
        new Effect((buildItem, buildCity, cost: number): number => cost + 1)
      ),
      new BuildCostModifier(
        new Criterion((buildItem, buildCity) => buildCity !== city),
        new Effect((): number => 0)
      )
    );

    availableBuildItemsRegistry.register(Unit);

    cityBuild.build(Unit);

    expect(cityBuild.cost().value()).equal(21);
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

    expect(() => cityBuild.build(Unit)).throw(TypeError);
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
      ...buildCost(Unit, 10)
    );

    availableBuildItemsRegistry.register(Unit);

    cityBuild.build(Unit);

    expect(cityBuild.building()!.item()).equal(Unit);

    availableBuildItemsRegistry.unregister(Unit);

    cityBuild.revalidate();

    expect(cityBuild.building()).null;
  });

  it('should price the item being built again on `reprice()`, keeping the item and the progress', async (): Promise<void> => {
    const availableBuildItemsRegistry = new AvailableCityBuildItemsRegistry(),
      ruleRegistry = new RuleRegistry(),
      cityBuild = new CityBuild(
        await setUpCity(),
        availableBuildItemsRegistry,
        ruleRegistry
      );
    let doubled = true;

    ruleRegistry.register(
      new Build(new Effect((): IBuildCriterion => new Criterion(() => true))),
      ...buildCost(Unit, 10),
      new BuildCostModifier(
        new Criterion(() => doubled),
        new Effect((buildItem, buildCity, cost: number): number => cost * 2)
      )
    );

    availableBuildItemsRegistry.register(Unit);

    cityBuild.build(Unit);
    cityBuild.add(new BuildProgress(5));

    expect(cityBuild.cost().value()).equal(20);

    doubled = false;

    expect(cityBuild.cost().value()).equal(20);

    cityBuild.reprice();

    expect(cityBuild.cost().value()).equal(10);
    expect(cityBuild.building()!.cost().value()).equal(10);
    expect(cityBuild.building()!.item()).equal(Unit);
    expect(cityBuild.progress().value()).equal(5);
  });

  it('should stop building on `cancel()`, keeping the progress, and process the `BuildingCancelled` rules once', async (): Promise<void> => {
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
      ...buildCost(Unit, 10),
      new BuildingCancelled(new Effect(effectSpy))
    );

    availableBuildItemsRegistry.register(Unit);

    cityBuild.build(Unit);
    cityBuild.add(new BuildProgress(5));
    cityBuild.cancel();

    expect(cityBuild.building()).null;
    expect(cityBuild.cost().value()).equal(Infinity);
    expect(cityBuild.progress().value()).equal(5);
    expect(effectSpy).called.once;

    cityBuild.cancel();

    expect(effectSpy).called.once;
  });

  it('should do nothing on `reprice()` when nothing is being built', async (): Promise<void> => {
    const cityBuild = new CityBuild(await setUpCity());

    cityBuild.reprice();

    expect(cityBuild.building()).null;
    expect(cityBuild.cost().value()).equal(Infinity);
  });

  it('should list what it cannot build, and the ids of the rules that refused each', async (): Promise<void> => {
    const availableBuildItemsRegistry = new AvailableCityBuildItemsRegistry(),
      ruleRegistry = new RuleRegistry(),
      cityBuild = new CityBuild(
        await setUpCity(),
        availableBuildItemsRegistry,
        ruleRegistry
      ),
      refuse = () => new Criterion((): boolean => false);

    ruleRegistry.register(
      ...buildCosts([
        [Warrior, 10],
        [Spearman, 20],
        [Horseman, 20],
      ]),
      new Build('test:needs-bronze', Spearman, new Effect(refuse)),
      new Build('test:needs-horses', Horseman, new Effect(refuse)),
      new Build(Horseman, new Effect(refuse)),
      new Build(
        'test:fine',
        Horseman,
        new Effect(() => new Criterion((): boolean => true))
      )
    );
    availableBuildItemsRegistry.register(Warrior, Spearman, Horseman);

    expect(
      cityBuild.unavailable().map(({ item, refusedBy }) => [item, refusedBy])
    ).eql([
      [Spearman, ['test:needs-bronze']],
      [Horseman, ['test:needs-horses', null]],
    ]);
    expect(cityBuild.available().map((item) => item.item())).eql([Warrior]);
  });

  describe('rules that declare the items they are about', (): void => {
    class Other extends Buildable {
      public static build() {
        return new Other();
      }
    }

    class Family extends Buildable {}

    class Member extends Family {
      public static build() {
        return new Member();
      }
    }

    const criterion = (result: boolean) => (): IBuildCriterion =>
      new Criterion(() => result);

    it('should only check a rule against the items it declared, and those extending them', async (): Promise<void> => {
      const availableBuildItemsRegistry = new AvailableCityBuildItemsRegistry(),
        ruleRegistry = new RuleRegistry(),
        city = await setUpCity(),
        cityBuild = new CityBuild(
          city,
          availableBuildItemsRegistry,
          ruleRegistry
        ),
        checked: [string, string][] = [],
        record = (name: string) =>
          new Criterion((cityChecked: any, Item: any): boolean => {
            checked.push([name, Item.name]);

            return true;
          });

      ruleRegistry.register(
        new Build(Unit, record('unit'), new Effect(criterion(true))),
        new Build(Family, record('family'), new Effect(criterion(true))),
        new Build(record('everything'), new Effect(criterion(true)))
      );
      availableBuildItemsRegistry.register(Unit, Other, Member);

      expect(cityBuild.available().map((item) => item.item())).members([
        Unit,
        Other,
        Member,
      ]);
      expect(checked.sort()).eql(
        [
          ['everything', 'Member'],
          ['everything', 'Other'],
          ['everything', 'Unit'],
          ['family', 'Member'],
          ['unit', 'Unit'],
        ].sort()
      );
    });

    it('should give the same answer as checking every rule against every item', async (): Promise<void> => {
      const availableBuildItemsRegistry = new AvailableCityBuildItemsRegistry(),
        ruleRegistry = new RuleRegistry(),
        city = await setUpCity(),
        cityBuild = new CityBuild(
          city,
          availableBuildItemsRegistry,
          ruleRegistry
        ),
        rules = [
          new Build(
            Unit,
            new Criterion((c: any, Item: any) => Item === Unit),
            new Effect(criterion(true))
          ),
          new Build(
            Family,
            new Criterion((c: any, Item: any) =>
              Object.prototype.isPrototypeOf.call(Family, Item)
            ),
            new Effect(criterion(false))
          ),
          new Build(
            Other,
            new Criterion((c: any, Item: any) => Item === Other),
            new Effect(criterion(true))
          ),
          new Build(new Effect(criterion(true))),
        ];

      ruleRegistry.register(...rules);
      availableBuildItemsRegistry.register(Unit, Other, Member);

      const everything = availableBuildItemsRegistry
        .entries()
        .filter((Item) =>
          rules
            .filter((rule) => rule.validate(city, Item))
            .every((rule) => rule.process(city, Item).validate())
        );

      expect(everything).members([Unit, Other]);
      expect(cityBuild.available().map((item) => item.item())).members(
        everything
      );
    });

    it('should check a rule that declares more than one item against each of them', async (): Promise<void> => {
      const rule = new Build(Unit, Other, new Effect(criterion(true)));

      expect(rule.mayApplyTo(Unit)).true;
      expect(rule.mayApplyTo(Other)).true;
      expect(rule.mayApplyTo(Member)).false;
      expect(rule.items()).eql([Unit, Other]);
      expect(new Build(new Effect(criterion(true))).items()).null;
      expect(new Build(new Effect(criterion(true))).mayApplyTo(Member)).true;
    });

    it('should keep the rule id, priority and effect of a rule that declares items', async (): Promise<void> => {
      const priority = new Priority(10),
        rule = new Build(
          'test:city/build/unit',
          Unit,
          priority,
          new Effect(criterion(true))
        );

      expect(rule.id()).equal('test:city/build/unit');
      expect(rule.priority()).equal(priority);
      expect(rule.process(null as any, Unit).validate()).true;
    });

    it('should pick up a rule registered, and one disabled, after the first check', async (): Promise<void> => {
      const availableBuildItemsRegistry = new AvailableCityBuildItemsRegistry(),
        ruleRegistry = new RuleRegistry(),
        cityBuild = new CityBuild(
          await setUpCity(),
          availableBuildItemsRegistry,
          ruleRegistry
        ),
        allow = new Build(new Effect(criterion(true))),
        deny = new Build(Unit, new Effect(criterion(false)));

      availableBuildItemsRegistry.register(Unit, Other);
      ruleRegistry.register(allow);

      expect(cityBuild.available()).length(2);

      ruleRegistry.register(deny);

      expect(cityBuild.available().map((item) => item.item())).members([Other]);

      deny.disable();
      ruleRegistry.invalidateCache(deny);

      expect(cityBuild.available()).length(2);

      ruleRegistry.unregister(allow);

      expect(cityBuild.available()).length(2);
    });
  });
});
