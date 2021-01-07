import {
  AvailableCityBuildItemsRegistry,
  instance as availableCityBuildItemsRegistryInstance,
} from './AvailableCityBuildItemsRegistry';
import { Build, IBuildRegistry } from './Rules/Build';
import { BuildCost, IBuildCostRegistry } from './Rules/BuildCost';
import {
  BuildingCancelled,
  IBuildingCancelledRegistry,
} from './Rules/BulidingCancelled';
import {
  BuildingComplete,
  IBuildingCompleteRegistry,
  ICompletedBuildItem,
} from './Rules/BulidingComplete';
import {
  RuleRegistry,
  instance as ruleRegistryInstance,
} from '@civ-clone/core-rule/RuleRegistry';
import { BuildProgress } from './Yields';
import City from '@civ-clone/core-city/City';
import CityImprovement from '@civ-clone/core-city-improvement/CityImprovement';
import { IConstructor } from '@civ-clone/core-registry/Registry';
import Unit from '@civ-clone/core-unit/Unit';
import Yield from '@civ-clone/core-yield/Yield';

// export type IBuildItem = IConstructor<CityImprovement> | IConstructor<Unit>;

export interface ICityBuild {
  add(production: Yield): void;
  // available(): IBuildItem[];
  available(): IConstructor[];
  // build(BuildItem: IBuildItem): void;
  build(BuildItem: IConstructor): void;
  // building(): IBuildItem | null;
  building(): IConstructor | null;
  check(): void;
  cost(): BuildProgress;
  progress(): BuildProgress;
  remaining(): number;
  revalidate(): void;
}

export class CityBuild implements ICityBuild {
  #availableCityBuildItemsRegistry: AvailableCityBuildItemsRegistry;
  // #building: IBuildItem | null = null;
  #building: IConstructor | null = null;
  #city: City;
  #cost: BuildProgress = new BuildProgress(Infinity);
  #progress: BuildProgress = new BuildProgress();
  #ruleRegistry: RuleRegistry;

  constructor(
    city: City,
    availableCityBuildItemsRegistry: AvailableCityBuildItemsRegistry = availableCityBuildItemsRegistryInstance,
    ruleRegistry: RuleRegistry = ruleRegistryInstance
  ) {
    this.#availableCityBuildItemsRegistry = availableCityBuildItemsRegistry;
    this.#city = city;
    this.#ruleRegistry = ruleRegistry;
  }

  add(production: Yield): void {
    this.#progress.add(production);
  }

  // available(): IBuildItem[] {
  available(): IConstructor[] {
    const buildImprovementRules = (this.#ruleRegistry as IBuildRegistry).get(
      Build
    );

    // TODO: this still feels awkward... It's either this, or every rule has to be 'either it isn't this thing we're
    //  checking or it is and it meets the condition' or it's this. It'd be nice to be able to just filter the list in a
    //  more straightforward way...
    return (
      this.#availableCityBuildItemsRegistry
        // .filter((buildItem: IBuildItem): boolean =>
        .filter((BuildItem: IConstructor): boolean =>
          buildImprovementRules
            .filter((rule: Build): boolean =>
              rule.validate(this.city(), BuildItem)
            )
            .every((rule: Build): boolean =>
              rule.process(this.city(), BuildItem).validate()
            )
        )
    );
  }

  // build(BuildItem: IBuildItem): void {
  build(BuildItem: IConstructor): void {
    if (
      !this.available().some(
        // (Entity: IBuildItem): boolean => Entity === BuildItem
        (Entity: IConstructor): boolean => Entity === BuildItem
      )
    ) {
      throw new TypeError(
        `Cannot build ${BuildItem.name}, it's not available.`
      );
    }

    this.#building = BuildItem;

    const [cost] = (this.#ruleRegistry as IBuildCostRegistry).process(
      BuildCost,
      BuildItem,
      this.#city
    );

    this.#cost.set(cost);
  }

  // building(): IBuildItem | null {
  building(): IConstructor | null {
    return this.#building;
  }

  // TODO: do this via Rules
  check(): ICompletedBuildItem | null {
    if (this.#progress.value() >= this.#cost.value()) {
      const built = (this.#building as
        | typeof Unit
        | typeof CityImprovement).createFromObject({
        city: this.#city,
        player: this.#city.player(),
        ruleRegistry: this.#ruleRegistry,
        tile: this.#city.tile(),
      });

      this.#progress.set(0);
      this.#building = null;
      this.#cost.set(Infinity);

      (this.#ruleRegistry as IBuildingCompleteRegistry).process(
        BuildingComplete,
        this,
        built
      );

      return built;
    }

    return null;
  }

  city(): City {
    return this.#city;
  }

  cost(): BuildProgress {
    return this.#cost;
  }

  progress(): BuildProgress {
    return this.#progress;
  }

  remaining(): number {
    return this.#cost.value() - this.#progress.value();
  }

  revalidate(): void {
    if (
      !this.available().some(
        // (Entity: IBuildItem): boolean => Entity === this.#building
        (Entity: IConstructor): boolean => Entity === this.#building
      )
    ) {
      this.#building = null;
      this.#cost.set(Infinity);

      (this.#ruleRegistry as IBuildingCancelledRegistry).process(
        BuildingCancelled,
        this
      );
    }
  }
}

export default CityBuild;
