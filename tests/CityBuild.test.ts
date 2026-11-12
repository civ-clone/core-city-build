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
import BuildingHeld from '../Rules/BuildingHeld';
import CityBuild from '../CityBuild';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import Hold from '../Rules/Hold';
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

  describe('why it is building nothing (civ-clone/web-renderer#716)', (): void => {
    const setUp = async () => {
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

      return { availableBuildItemsRegistry, cityBuild, ruleRegistry };
    };

    it('should know of no reason to begin with', async (): Promise<void> => {
      const { cityBuild } = await setUp();

      expect(cityBuild.cleared()).null;
    });

    it('should give the item it completed', async (): Promise<void> => {
      const { cityBuild } = await setUp();

      cityBuild.build(Unit);
      cityBuild.add(new BuildProgress(10));
      cityBuild.check();

      expect(cityBuild.cleared()).eql({ reason: 'completed', item: Unit });
    });

    it('should give the item cancelled, with the reason given', async (): Promise<void> => {
      const { cityBuild } = await setUp();

      cityBuild.build(Unit);
      cityBuild.cancel();

      expect(cityBuild.cleared()).eql({ reason: 'cancelled', item: Unit });

      cityBuild.build(Unit);
      cityBuild.cancel('captured');

      expect(cityBuild.cleared()).eql({ reason: 'captured', item: Unit });
    });

    it('should give the item it can no longer build, on `revalidate()`', async (): Promise<void> => {
      const { availableBuildItemsRegistry, cityBuild } = await setUp();

      cityBuild.build(Unit);
      availableBuildItemsRegistry.unregister(Unit);
      cityBuild.revalidate();

      expect(cityBuild.cleared()).eql({ reason: 'unavailable', item: Unit });
    });

    it('should forget the reason when something is chosen', async (): Promise<void> => {
      const { cityBuild } = await setUp();

      cityBuild.setCleared('created');

      expect(cityBuild.cleared()).eql({ reason: 'created', item: null });

      cityBuild.build(Unit);

      expect(cityBuild.cleared()).null;

      cityBuild.cancel();
      cityBuild.build(Unit);

      expect(cityBuild.cleared()).null;
    });

    it('should give none while it is building something', async (): Promise<void> => {
      const { cityBuild } = await setUp();

      cityBuild.build(Unit);
      cityBuild.setCleared('captured');

      expect(cityBuild.cleared()).null;
    });

    it('should forget it when a `BuildingComplete` rule chooses the next build', async (): Promise<void> => {
      const { cityBuild, ruleRegistry } = await setUp();

      ruleRegistry.register(
        new BuildingComplete(
          new Effect((completed: CityBuild): void => completed.build(Unit))
        )
      );

      cityBuild.build(Unit);
      cityBuild.add(new BuildProgress(10));
      cityBuild.check();

      expect(cityBuild.building()!.item()).equal(Unit);
      expect(cityBuild.cleared()).null;
    });

    it('should give none for a build restored from a save made before it existed', async (): Promise<void> => {
      const { cityBuild } = await setUp();

      delete (cityBuild as unknown as { _cleared?: unknown })._cleared;

      expect(cityBuild.cleared()).null;
    });

    it('should be sent with the build', async (): Promise<void> => {
      const { cityBuild } = await setUp();

      expect(cityBuild.keys()).include('cleared');
    });
  });

  describe('a held build (civ-clone/web-renderer#959)', (): void => {
    const setUp = async () => {
      const availableBuildItemsRegistry = new AvailableCityBuildItemsRegistry(),
        ruleRegistry = new RuleRegistry(),
        cityBuild = new CityBuild(
          await setUpCity(),
          availableBuildItemsRegistry,
          ruleRegistry
        ),
        completed = spy(),
        // Whether the `Hold` rule below holds it.
        holding = { on: true };

      ruleRegistry.register(
        new Build(new Effect((): IBuildCriterion => new Criterion(() => true))),
        ...buildCost(Unit, 10),
        new BuildingComplete(new Effect(completed)),
        new Hold(
          'test:city/hold/unit',
          new Criterion(
            (heldBuild: CityBuild, BuildItem: Buildable): boolean =>
              heldBuild === cityBuild && BuildItem === Unit
          ),
          new Criterion((): boolean => holding.on)
        )
      );

      availableBuildItemsRegistry.register(Unit);

      cityBuild.build(Unit);

      return { cityBuild, completed, holding, ruleRegistry };
    };

    it("should not complete the item while a `Hold` rule's criteria are met", async (): Promise<void> => {
      const { cityBuild, completed } = await setUp();

      cityBuild.add(new BuildProgress(10));

      expect(cityBuild.check()).null;
      expect(completed).not.called;
      expect(cityBuild.building()!.item()).equal(Unit);
      expect(cityBuild.cleared()).null;
      expect(cityBuild.progress().value()).equal(10);
    });

    it('should keep the progress, which goes on growing past the cost, and complete it once nothing holds it', async (): Promise<void> => {
      const { cityBuild, completed, holding } = await setUp();

      cityBuild.add(new BuildProgress(10));
      cityBuild.check();
      cityBuild.add(new BuildProgress(4));
      cityBuild.check();

      expect(cityBuild.progress().value()).equal(14);
      expect(cityBuild.remaining()).equal(-4);

      holding.on = false;

      expect(cityBuild.check()).instanceof(Unit);
      expect(completed).called.once;
      expect(cityBuild.cleared()).eql({ reason: 'completed', item: Unit });
      expect(cityBuild.progress().value()).equal(0);
    });

    it("should give the holding rules' ids from the moment the item is chosen, whatever its progress", async (): Promise<void> => {
      const { cityBuild, holding, ruleRegistry } = await setUp();

      // Not paid for yet: a client can say it will wait.
      expect(cityBuild.held()).eql(['test:city/hold/unit']);
      expect(cityBuild.remaining()).equal(10);

      cityBuild.add(new BuildProgress(9));

      expect(cityBuild.held()).eql(['test:city/hold/unit']);

      // Paid for: a client can say it is waiting now.
      cityBuild.add(new BuildProgress(1));

      expect(cityBuild.held()).eql(['test:city/hold/unit']);
      expect(cityBuild.remaining()).equal(0);

      ruleRegistry.register(new Hold());

      expect(cityBuild.held()).eql(['test:city/hold/unit', null]);

      holding.on = false;

      expect(cityBuild.held()).eql([null]);
    });

    it('should not complete the item before its progress reaches the cost when nothing holds it', async (): Promise<void> => {
      const { cityBuild, completed, holding } = await setUp();

      holding.on = false;
      cityBuild.add(new BuildProgress(9));

      expect(cityBuild.held()).eql([]);
      expect(cityBuild.check()).null;
      expect(completed).not.called;
    });

    it('should give none while the city builds nothing', async (): Promise<void> => {
      const { cityBuild } = await setUp();

      cityBuild.add(new BuildProgress(10));
      cityBuild.cancel();

      expect(cityBuild.held()).eql([]);
    });

    it('should not hold for a rule that is switched off', async (): Promise<void> => {
      const { cityBuild, completed, ruleRegistry } = await setUp();

      ruleRegistry.getById('test:city/hold/unit')!.disable();
      cityBuild.add(new BuildProgress(10));

      expect(cityBuild.held()).eql([]);
      expect(cityBuild.check()).instanceof(Unit);
      expect(completed).called.once;
    });

    it('should be sent with the build', async (): Promise<void> => {
      const { cityBuild } = await setUp();

      expect(cityBuild.keys()).include('held');
    });

    it('should give none while the city builds nothing, even for a rule with no criteria', async (): Promise<void> => {
      const { cityBuild, ruleRegistry } = await setUp();

      ruleRegistry.register(new Hold());
      cityBuild.cancel();

      expect(cityBuild.held()).eql([]);
    });
  });

  describe('a held build, asked about an item (civ-clone/web-renderer#970)', (): void => {
    class Other extends Buildable {
      public static build() {
        return new Other();
      }
    }

    const setUp = async () => {
      const availableBuildItemsRegistry = new AvailableCityBuildItemsRegistry(),
        ruleRegistry = new RuleRegistry(),
        cityBuild = new CityBuild(
          await setUpCity(),
          availableBuildItemsRegistry,
          ruleRegistry
        ),
        holding = { on: true };

      ruleRegistry.register(
        new Build(new Effect((): IBuildCriterion => new Criterion(() => true))),
        ...buildCosts([
          [Unit, 10],
          [Other, 10],
        ]),
        new Hold(
          'test:city/hold/unit',
          new Criterion(
            (heldBuild: CityBuild, BuildItem: Buildable): boolean =>
              heldBuild === cityBuild && BuildItem === Unit
          ),
          new Criterion((): boolean => holding.on)
        )
      );

      availableBuildItemsRegistry.register(Unit, Other);

      return { cityBuild, holding, ruleRegistry };
    };

    it('should give the rules that would hold an item while the city builds nothing', async (): Promise<void> => {
      const { cityBuild } = await setUp();

      expect(cityBuild.building()).null;
      expect(cityBuild.held(Unit)).eql(['test:city/hold/unit']);
      expect(cityBuild.held(Other)).eql([]);
      expect(cityBuild.held()).eql([]);
    });

    it('should give the rules that would hold an item while the city builds something else', async (): Promise<void> => {
      const { cityBuild } = await setUp();

      cityBuild.build(Other);

      expect(cityBuild.held(Unit)).eql(['test:city/hold/unit']);
      expect(cityBuild.held(Other)).eql([]);
      // Without an item, what the city is building, as before.
      expect(cityBuild.held()).eql([]);

      cityBuild.build(Unit);

      expect(cityBuild.held()).eql(['test:city/hold/unit']);
      expect(cityBuild.held(Other)).eql([]);
    });

    it('should follow the rules as they change, and leave out a rule that is switched off', async (): Promise<void> => {
      const { cityBuild, holding, ruleRegistry } = await setUp();

      holding.on = false;

      expect(cityBuild.held(Unit)).eql([]);

      holding.on = true;
      ruleRegistry.register(new Hold());

      expect(cityBuild.held(Other)).eql([null]);
      expect(cityBuild.held(Unit)).eql(['test:city/hold/unit', null]);

      ruleRegistry.getById('test:city/hold/unit')!.disable();

      expect(cityBuild.held(Unit)).eql([null]);
    });

    it('should change nothing about the build', async (): Promise<void> => {
      const { cityBuild } = await setUp();

      cityBuild.build(Other);
      cityBuild.add(new BuildProgress(10));
      cityBuild.held(Unit);

      expect(cityBuild.building()!.item()).equal(Other);
      expect(cityBuild.check()).instanceof(Other);
    });
  });

  describe('a build becoming held (civ-clone/web-renderer#970)', (): void => {
    const setUp = async () => {
      const availableBuildItemsRegistry = new AvailableCityBuildItemsRegistry(),
        ruleRegistry = new RuleRegistry(),
        cityBuild = new CityBuild(
          await setUpCity(),
          availableBuildItemsRegistry,
          ruleRegistry
        ),
        completed = spy(),
        // Whether it was this build, rather than the build itself, which a failing comparison would print in full.
        events: [boolean, Buildable, (string | null)[]][] = [],
        holding = { on: true };

      ruleRegistry.register(
        new Build(new Effect((): IBuildCriterion => new Criterion(() => true))),
        ...buildCost(Unit, 10),
        new BuildingComplete(new Effect(completed)),
        new BuildingHeld(
          new Effect(
            (
              heldBuild: CityBuild,
              item: Buildable,
              held: (string | null)[]
            ): void => {
              events.push([heldBuild === cityBuild, item, held]);
            }
          )
        ),
        new Hold(
          'test:city/hold/unit',
          new Criterion(
            (heldBuild: CityBuild, BuildItem: Buildable): boolean =>
              heldBuild === cityBuild && BuildItem === Unit
          ),
          new Criterion((): boolean => holding.on)
        )
      );

      availableBuildItemsRegistry.register(Unit);

      cityBuild.build(Unit);

      return { cityBuild, completed, events, holding, ruleRegistry };
    };

    it('should be processed once, with the build, the item and the holding rules, when production pays for it', async (): Promise<void> => {
      const { cityBuild, events } = await setUp();

      cityBuild.add(new BuildProgress(5));
      cityBuild.check();

      expect(events).eql([]);

      cityBuild.add(new BuildProgress(6));

      expect(events).eql([[true, Unit, ['test:city/hold/unit']]]);

      expect(cityBuild.check()).null;
    });

    it('should not be processed again on the turns the build goes on waiting', async (): Promise<void> => {
      const { cityBuild, events } = await setUp();

      cityBuild.add(new BuildProgress(10));
      cityBuild.check();
      cityBuild.add(new BuildProgress(3));
      cityBuild.check();
      cityBuild.add(new BuildProgress(3));
      cityBuild.check();

      expect(events.length).equal(1);
      expect(cityBuild.progress().value()).equal(16);
    });

    it('should be processed when a purchase pays exactly what remains', async (): Promise<void> => {
      const { cityBuild, events } = await setUp();

      cityBuild.add(new BuildProgress(4));
      // What a purchase adds (`PlayerTreasury#buy`).
      cityBuild.add(new BuildProgress(cityBuild.remaining()));

      expect(cityBuild.remaining()).equal(0);
      expect(events.length).equal(1);

      // A build paid exactly is paid: more shields don't announce it again.
      cityBuild.add(new BuildProgress(1));

      expect(events.length).equal(1);
    });

    it("should be processed when a Caravan's help pays for it in one go", async (): Promise<void> => {
      const { cityBuild, events } = await setUp();

      cityBuild.add(new BuildProgress(50));

      expect(events).eql([[true, Unit, ['test:city/hold/unit']]]);
    });

    it('should not be processed for a build that completes', async (): Promise<void> => {
      const { cityBuild, completed, events, holding } = await setUp();

      holding.on = false;
      cityBuild.add(new BuildProgress(10));

      expect(cityBuild.check()).instanceof(Unit);
      expect(completed).called.once;
      expect(events).eql([]);
    });

    it('should not be processed while the city builds nothing', async (): Promise<void> => {
      const { cityBuild, events, ruleRegistry } = await setUp();

      ruleRegistry.register(new Hold());
      cityBuild.cancel();
      cityBuild.add(new BuildProgress(50));

      expect(events).eql([]);
    });

    it('should not be processed for a hold that starts once the build is paid for', async (): Promise<void> => {
      const { cityBuild, events, holding } = await setUp();

      holding.on = false;
      cityBuild.add(new BuildProgress(10));
      holding.on = true;
      cityBuild.add(new BuildProgress(1));

      // Waiting, as `held()` says, but not announced.
      expect(cityBuild.held()).eql(['test:city/hold/unit']);
      expect(cityBuild.check()).null;
      expect(events).eql([]);
    });

    it('should complete as ever once the hold ends, and not be processed again', async (): Promise<void> => {
      const { cityBuild, completed, events, holding } = await setUp();

      cityBuild.add(new BuildProgress(10));
      cityBuild.check();
      holding.on = false;
      cityBuild.add(new BuildProgress(1));

      expect(cityBuild.check()).instanceof(Unit);
      expect(completed).called.once;
      expect(events.length).equal(1);
    });

    it('should be processed again when the progress is emptied and paid again', async (): Promise<void> => {
      const { cityBuild, events } = await setUp();

      cityBuild.add(new BuildProgress(10));
      // A Diplomat's sabotage, or a capture.
      cityBuild.progress().set(0);
      cityBuild.add(new BuildProgress(10));

      expect(events.length).equal(2);
    });

    it('should not be processed when the item is chosen again with its shields already there', async (): Promise<void> => {
      const { cityBuild, events } = await setUp();

      cityBuild.add(new BuildProgress(10));
      cityBuild.cancel();
      cityBuild.build(Unit);
      cityBuild.add(new BuildProgress(1));

      // Paid for by the choice, not by shields: `held()` says it is waiting.
      expect(events.length).equal(1);
      expect(cityBuild.held()).eql(['test:city/hold/unit']);
    });

    it('should not be processed when a cheaper item is chosen with the shields already there', async (): Promise<void> => {
      class Dearer extends Buildable {
        public static build() {
          return new Dearer();
        }
      }

      const { cityBuild, events, ruleRegistry } = await setUp();

      ruleRegistry.register(...buildCost(Dearer, 20));
      (
        cityBuild as unknown as {
          _availableCityBuildItemsRegistry: AvailableCityBuildItemsRegistry;
        }
      )._availableCityBuildItemsRegistry.register(Dearer);

      cityBuild.build(Dearer);
      cityBuild.add(new BuildProgress(10));
      cityBuild.build(Unit);
      cityBuild.add(new BuildProgress(1));

      expect(cityBuild.remaining()).equal(-1);
      expect(events).eql([]);
      expect(cityBuild.held()).eql(['test:city/hold/unit']);
    });

    it('should not be processed when a new price pays for it', async (): Promise<void> => {
      const { cityBuild, events, ruleRegistry } = await setUp(),
        halved = { on: false };

      ruleRegistry.register(
        new BuildCostModifier(
          new Criterion((): boolean => halved.on),
          new Effect((buildItem, buildCity, cost: number): number => cost / 2)
        )
      );

      cityBuild.add(new BuildProgress(6));
      halved.on = true;
      cityBuild.reprice();
      cityBuild.add(new BuildProgress(1));

      expect(cityBuild.remaining()).equal(-2);
      expect(events).eql([]);
      expect(cityBuild.held()).eql(['test:city/hold/unit']);
    });

    it('should not be processed by a build that can no longer build its item', async (): Promise<void> => {
      const { cityBuild, events } = await setUp();

      cityBuild.add(new BuildProgress(5));
      (
        cityBuild as unknown as {
          _availableCityBuildItemsRegistry: AvailableCityBuildItemsRegistry;
        }
      )._availableCityBuildItemsRegistry.unregister(Unit);
      cityBuild.revalidate();
      cityBuild.add(new BuildProgress(5));

      expect(cityBuild.building()).null;
      expect(events).eql([]);
    });

    it('should give `null` for a holding rule with no id', async (): Promise<void> => {
      const { cityBuild, events, ruleRegistry } = await setUp();

      ruleRegistry.register(new Hold());
      cityBuild.add(new BuildProgress(10));

      expect(events).eql([[true, Unit, ['test:city/hold/unit', null]]]);
    });

    it('should keep nothing on the build, so a save holds nothing more', async (): Promise<void> => {
      const { cityBuild, events } = await setUp(),
        fields = Object.keys(cityBuild).sort(),
        keys = [...cityBuild.keys()];

      cityBuild.add(new BuildProgress(10));
      cityBuild.check();

      expect(events.length).equal(1);
      expect(Object.keys(cityBuild).sort()).eql(fields);
      expect(cityBuild.keys()).eql(keys);
    });
  });

  describe('the queue (civ-clone/web-renderer#774)', (): void => {
    class Second extends Buildable {
      public static build() {
        return new Second();
      }
    }

    class Third extends Buildable {
      public static build() {
        return new Third();
      }
    }

    const setUp = async () => {
      const availableBuildItemsRegistry = new AvailableCityBuildItemsRegistry(),
        ruleRegistry = new RuleRegistry(),
        cityBuild = new CityBuild(
          await setUpCity(),
          availableBuildItemsRegistry,
          ruleRegistry
        );

      ruleRegistry.register(
        new Build(new Effect((): IBuildCriterion => new Criterion(() => true))),
        ...buildCost(Unit, 10),
        ...buildCost(Second, 20),
        ...buildCost(Third, 30)
      );

      availableBuildItemsRegistry.register(Unit, Second, Third);

      return { availableBuildItemsRegistry, cityBuild, ruleRegistry };
    };

    const complete = (cityBuild: CityBuild): void => {
      cityBuild.add(new BuildProgress(cityBuild.remaining()));
      cityBuild.check();
    };

    it('should be sent by a build loaded from a save made before it existed', async (): Promise<void> => {
      const { cityBuild } = await setUp(),
        loaded = Object.assign(Object.create(CityBuild.prototype), cityBuild, {
          _keys: cityBuild
            .keys()
            .filter((key) => key !== 'queue' && key !== 'queueDropped'),
        }) as CityBuild;

      loaded.onHydrated();

      expect(loaded.keys()).include.members(['queue', 'queueDropped']);
      expect(loaded.keys().filter((key) => key === 'building').length).equal(1);
    });

    it('should be empty to begin with, and for a build saved before it existed', async (): Promise<void> => {
      const { cityBuild } = await setUp();

      expect(cityBuild.queued()).eql([]);
      expect(cityBuild.queueDropped()).eql([]);

      delete (cityBuild as unknown as { _queue?: unknown })._queue;
      delete (cityBuild as unknown as { _queueDropped?: unknown })
        ._queueDropped;

      expect(cityBuild.queued()).eql([]);
      expect(cityBuild.queueDropped()).eql([]);
    });

    it('should add at the end or at a position, remove, move and clear', async (): Promise<void> => {
      const { cityBuild } = await setUp();

      cityBuild.enqueue(Second);
      cityBuild.enqueue(Third);
      cityBuild.enqueue(Unit, 0);

      expect(cityBuild.queued()).eql([Unit, Second, Third]);

      cityBuild.requeue(0, 2);

      expect(cityBuild.queued()).eql([Second, Third, Unit]);

      cityBuild.requeue(2, 0);
      cityBuild.requeue(5, 0);
      cityBuild.requeue(-1, 0);

      expect(cityBuild.queued()).eql([Unit, Second, Third]);

      cityBuild.requeue(-1, 1);

      expect(cityBuild.queued()).eql([Second, Unit, Third]);

      cityBuild.dequeue(5);
      cityBuild.dequeue(-1);

      expect(cityBuild.queued()).eql([Unit, Third]);

      cityBuild.clearQueue();

      expect(cityBuild.queued()).eql([]);
    });

    it("should refuse to queue what the city can't build", async (): Promise<void> => {
      const { availableBuildItemsRegistry, cityBuild } = await setUp();

      availableBuildItemsRegistry.unregister(Third);

      expect(() => cityBuild.enqueue(Third)).throw(TypeError);
    });

    it('should give each queued item priced for the city, and be sent with the build', async (): Promise<void> => {
      const { cityBuild } = await setUp();

      cityBuild.enqueue(Second);

      expect(
        cityBuild
          .queue()
          .map((buildItem) => [buildItem.item(), buildItem.cost().value()])
      ).eql([[Second, 20]]);
      expect(cityBuild.keys()).include.members(['queue', 'queueDropped']);
    });

    it('should start the next item when one is complete, before the `BuildingComplete` rules', async (): Promise<void> => {
      const { cityBuild, ruleRegistry } = await setUp(),
        seen: (Buildable | null)[] = [];

      ruleRegistry.register(
        new BuildingComplete(
          new Effect((completed: CityBuild): void => {
            seen.push(completed.building()?.item() ?? null);
          })
        )
      );

      cityBuild.build(Unit);
      cityBuild.enqueue(Second);
      cityBuild.enqueue(Third);

      complete(cityBuild);

      expect(cityBuild.building()!.item()).equal(Second);
      expect(cityBuild.cost().value()).equal(20);
      expect(cityBuild.queued()).eql([Third]);
      expect(seen).eql([Second]);

      complete(cityBuild);
      complete(cityBuild);

      expect(cityBuild.building()).null;
      expect(cityBuild.cleared()!.item).equal(Third);
      expect(seen).eql([Second, Third, null]);
    });

    it('should drop what it can no longer build, and say so', async (): Promise<void> => {
      const { availableBuildItemsRegistry, cityBuild } = await setUp();

      cityBuild.build(Unit);
      cityBuild.enqueue(Second);
      cityBuild.enqueue(Third);

      availableBuildItemsRegistry.unregister(Second);

      complete(cityBuild);

      expect(cityBuild.building()!.item()).equal(Third);
      expect(cityBuild.queueDropped()).eql([Second]);
      expect(cityBuild.queued()).eql([]);
    });

    it('should forget what it dropped once something else is chosen for the city', async (): Promise<void> => {
      const { availableBuildItemsRegistry, cityBuild } = await setUp();

      cityBuild.build(Unit);
      cityBuild.enqueue(Second);
      cityBuild.enqueue(Third);

      availableBuildItemsRegistry.unregister(Second);

      complete(cityBuild);

      expect(cityBuild.queueDropped()).eql([Second]);

      // The player chooses something else by hand: the drop has been said.
      cityBuild.build(Unit);

      expect(cityBuild.building()!.item()).equal(Unit);
      expect(cityBuild.queueDropped()).eql([]);
    });

    it('should keep what it dropped when a rule chooses the next item as the last is completed', async (): Promise<void> => {
      const { availableBuildItemsRegistry, cityBuild, ruleRegistry } =
        await setUp();

      // Auto, or a standing order: with nothing left in the queue, it chooses.
      ruleRegistry.register(
        new BuildingComplete(
          new Effect((completed: CityBuild): void => {
            if (completed.building() === null) {
              completed.build(Unit);
            }
          })
        )
      );

      cityBuild.build(Unit);
      cityBuild.enqueue(Second);

      availableBuildItemsRegistry.unregister(Second);

      complete(cityBuild);

      expect(cityBuild.building()!.item()).equal(Unit);
      expect(cityBuild.queueDropped()).eql([Second]);
    });

    it('should leave the city to its player when the current item can no longer be built, keeping the queue', async (): Promise<void> => {
      const { availableBuildItemsRegistry, cityBuild, ruleRegistry } =
          await setUp(),
        seen: (Buildable | null)[] = [];

      ruleRegistry.register(
        new BuildingCancelled(
          new Effect((cancelled: CityBuild): void => {
            seen.push(cancelled.building()?.item() ?? null);
          })
        )
      );

      cityBuild.build(Unit);
      cityBuild.enqueue(Second);

      availableBuildItemsRegistry.unregister(Unit);

      cityBuild.revalidate();

      expect(cityBuild.building()).null;
      expect(cityBuild.cleared()).eql({ reason: 'unavailable', item: Unit });
      expect(cityBuild.queued()).eql([Second]);
      expect(seen).eql([null]);
    });

    it('should keep the queue when the player stops building, and drop it when the city changes hands', async (): Promise<void> => {
      const { cityBuild } = await setUp();

      cityBuild.build(Unit);
      cityBuild.enqueue(Second);
      cityBuild.cancel();

      expect(cityBuild.building()).null;
      expect(cityBuild.queued()).eql([Second]);

      cityBuild.build(Unit);
      cityBuild.cancel('captured');

      expect(cityBuild.queued()).eql([]);

      cityBuild.enqueue(Second);
      cityBuild.setCleared('captured');

      expect(cityBuild.queued()).eql([]);
    });

    it('should go on to its queue on Auto when the current item can no longer be built, before the rules', async (): Promise<void> => {
      const { availableBuildItemsRegistry, cityBuild, ruleRegistry } =
          await setUp(),
        seen: (Buildable | null)[] = [];

      ruleRegistry.register(
        new BuildingCancelled(
          new Effect((cancelled: CityBuild): void => {
            seen.push(cancelled.building()?.item() ?? null);
          })
        )
      );

      cityBuild.setAuto(true);
      cityBuild.build(Unit);
      cityBuild.enqueue(Second);

      availableBuildItemsRegistry.unregister(Unit);

      cityBuild.revalidate();

      expect(cityBuild.building()!.item()).equal(Second);
      expect(cityBuild.queued()).eql([]);
      expect(seen).eql([Second]);
    });

    it('should start the first queued item when the player chooses it, not build it twice', async (): Promise<void> => {
      const { cityBuild } = await setUp();

      cityBuild.build(Unit);
      cityBuild.enqueue(Second);
      cityBuild.enqueue(Second);
      cityBuild.enqueue(Third);
      cityBuild.cancel();

      cityBuild.choose(Second);

      expect(cityBuild.building()!.item()).equal(Second);
      expect(cityBuild.queued()).eql([Second, Third]);

      cityBuild.choose(Third);

      expect(cityBuild.queued()).eql([Second, Third]);
    });

    it('should forget what it dropped when the city changes hands', async (): Promise<void> => {
      const { availableBuildItemsRegistry, cityBuild } = await setUp();

      cityBuild.build(Unit);
      cityBuild.enqueue(Second);
      cityBuild.enqueue(Third);

      availableBuildItemsRegistry.unregister(Second);

      complete(cityBuild);

      expect(cityBuild.queueDropped()).eql([Second]);

      cityBuild.cancel('captured');

      expect(cityBuild.queueDropped()).eql([]);
    });
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
