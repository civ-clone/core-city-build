import {
  AvailableCityBuildItemsRegistry,
  instance as availableCityBuildItemsRegistryInstance,
} from './AvailableCityBuildItemsRegistry';
import { Build, IBuildRegistry } from './Rules/Build';
import {
  BuildingCancelled,
  IBuildingCancelledRegistry,
} from './Rules/BulidingCancelled';
import {
  BuildingComplete,
  IBuildingCompleteRegistry,
} from './Rules/BulidingComplete';
import {
  DataObject,
  IDataObject,
} from '@civ-clone/core-data-object/DataObject';
import {
  RuleRegistry,
  instance as ruleRegistryInstance,
} from '@civ-clone/core-rule/RuleRegistry';
import BuildItem from './BuildItem';
import { BuildProgress } from './Yields';
import Buildable from './Buildable';
import City from '@civ-clone/core-city/City';
import Yield from '@civ-clone/core-yield/Yield';
import { IConstructor } from '@civ-clone/core-registry/Registry';

export interface ICityBuild extends IDataObject {
  add(production: Yield): void;
  available(): BuildItem[];
  build(ItemToBuild: typeof Buildable): void;
  building(): BuildItem | null;
  check(): void;
  cost(): BuildProgress;
  getAvailable(Item: typeof Buildable): BuildItem;
  progress(): BuildProgress;
  remaining(): number;
  revalidate(): void;
}

export class CityBuild extends DataObject implements ICityBuild {
  #availableCityBuildItemsRegistry: AvailableCityBuildItemsRegistry;
  #building: BuildItem | null = null;
  #city: City;
  #cost: BuildProgress = new BuildProgress(Infinity);
  #progress: BuildProgress = new BuildProgress();
  #ruleRegistry: RuleRegistry;

  constructor(
    city: City,
    availableCityBuildItemsRegistry: AvailableCityBuildItemsRegistry = availableCityBuildItemsRegistryInstance,
    ruleRegistry: RuleRegistry = ruleRegistryInstance
  ) {
    super();

    this.#availableCityBuildItemsRegistry = availableCityBuildItemsRegistry;
    this.#city = city;
    this.#ruleRegistry = ruleRegistry;

    this.addKey(
      'available',
      'building',
      'city',
      'cost',
      'progress',
      'remaining'
    );
  }

  add(production: Yield): void {
    this.#progress.add(production);
  }

  available(): BuildItem[] {
    const buildRules = (this.#ruleRegistry as IBuildRegistry).get(Build);

    // TODO: this still feels awkward... It's either this, or every rule has to be 'either it isn't this thing we're
    //  checking or it is and it meets the condition' or it's this. It'd be nice to be able to just filter the list in a
    //  more straightforward way...
    //  Also, yuck. The mixture of `typeof Buildable` and `IConstructor<Buildable>` sucks here...
    return (
      this.#availableCityBuildItemsRegistry.filter(
        (BuildItem: IConstructor<Buildable>): boolean =>
          buildRules
            .filter((rule: Build): boolean =>
              rule.validate(this.city(), BuildItem as typeof Buildable)
            )
            .every((rule: Build): boolean =>
              rule
                .process(this.city(), BuildItem as typeof Buildable)
                .validate()
            )
      ) as typeof Buildable[]
    ).map(
      (available) => new BuildItem(available, this.city(), this.#ruleRegistry)
    );
  }

  build(ItemToBuild: typeof Buildable): void {
    const buildItem = this.getAvailable(ItemToBuild);

    if (!buildItem) {
      throw new TypeError(
        `Cannot build ${ItemToBuild.name}, it's not available.`
      );
    }

    this.#building = buildItem;

    this.#cost.set(this.#building.cost().value());
  }

  building(): BuildItem | null {
    return this.#building;
  }

  // TODO: do this via Rules
  check(): Buildable | null {
    if (this.#progress.value() >= this.#cost.value() && this.#building) {
      const built = this.#building.item().build(this.#city, this.#ruleRegistry);

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

  getAvailable(Item: typeof Buildable): BuildItem {
    return this.available().filter(
      (available: BuildItem): boolean => available.item() === Item
    )[0];
  }

  progress(): BuildProgress {
    return this.#progress;
  }

  remaining(): number {
    return this.#cost.value() - this.#progress.value();
  }

  revalidate(): void {
    if (this.#building && !this.getAvailable(this.#building.item())) {
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
