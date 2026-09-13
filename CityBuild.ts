import {
  AvailableCityBuildItemsRegistry,
  instance as availableCityBuildItemsRegistryInstance,
} from './AvailableCityBuildItemsRegistry';
import {
  DataObject,
  IDataObject,
} from '@civ-clone/core-data-object/DataObject';
import {
  RuleRegistry,
  instance as ruleRegistryInstance,
} from '@civ-clone/core-rule/RuleRegistry';
import Build from './Rules/Build';
import BuildItem from './BuildItem';
import { BuildProgress } from './Yields';
import { IBuildable as Buildable } from './Buildable';
import BuildingCancelled from './Rules/BulidingCancelled';
import BuildingComplete from './Rules/BulidingComplete';
import City from '@civ-clone/core-city/City';
import { IConstructor } from '@civ-clone/core-registry/Registry';
import Yield from '@civ-clone/core-yield/Yield';

export interface ICityBuild extends IDataObject {
  add(production: Yield): void;
  available(): BuildItem[];
  build(ItemToBuild: Buildable): void;
  building(): BuildItem | null;
  check(): void;
  cost(): BuildProgress;
  getAvailable(Item: Buildable): BuildItem;
  progress(): BuildProgress;
  remaining(): number;
  revalidate(): void;
}

export class CityBuild extends DataObject implements ICityBuild {
  static readonly transient = [
    '_availableCityBuildItemsRegistry',
    '_ruleRegistry',
  ];
  private _availableCityBuildItemsRegistry: AvailableCityBuildItemsRegistry;
  private _building: BuildItem | null = null;
  private _city: City;
  private _cost: BuildProgress = new BuildProgress(Infinity);
  private _progress: BuildProgress = new BuildProgress();
  private _ruleRegistry: RuleRegistry;

  constructor(
    city: City,
    availableCityBuildItemsRegistry: AvailableCityBuildItemsRegistry = availableCityBuildItemsRegistryInstance,
    ruleRegistry: RuleRegistry = ruleRegistryInstance
  ) {
    super();

    this._availableCityBuildItemsRegistry = availableCityBuildItemsRegistry;
    this._city = city;
    this._ruleRegistry = ruleRegistry;

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
    this._progress.add(production);
  }

  available(): BuildItem[] {
    const buildRules = this._ruleRegistry.get(Build);

    // TODO: this still feels awkward... It's either this, or every rule has to be 'either it isn't this thing we're
    //  checking or it is and it meets the condition' or it's this. It'd be nice to be able to just filter the list in a
    //  more straightforward way...
    return (
      this._availableCityBuildItemsRegistry.filter(
        (BuildItem: Buildable): boolean =>
          buildRules
            .filter((rule: Build): boolean =>
              rule.validate(this.city(), BuildItem)
            )
            .every((rule: Build): boolean =>
              rule.process(this.city(), BuildItem).validate()
            )
      ) as Buildable[]
    ).map(
      (available) => new BuildItem(available, this.city(), this._ruleRegistry)
    );
  }

  build(ItemToBuild: Buildable): void {
    const buildItem = this.getAvailable(ItemToBuild);

    if (!buildItem) {
      throw new TypeError(
        `Cannot build ${ItemToBuild.name}, it's not available.`
      );
    }

    this._building = buildItem;

    this._cost.set(this._building.cost().value());
  }

  building(): BuildItem | null {
    return this._building;
  }

  check(): IDataObject | null {
    if (this._progress.value() >= this._cost.value() && this._building) {
      const built = this._building.item().build(this._city, this._ruleRegistry);

      this._progress.set(0);
      this._building = null;
      this._cost.set(Infinity);

      this._ruleRegistry.process(BuildingComplete, this, built);

      return built;
    }

    return null;
  }

  city(): City {
    return this._city;
  }

  cost(): BuildProgress {
    return this._cost;
  }

  getAvailable(Item: Buildable): BuildItem {
    return this.available().filter(
      (available: BuildItem): boolean => available.item() === Item
    )[0];
  }

  progress(): BuildProgress {
    return this._progress;
  }

  remaining(): number {
    return this._cost.value() - this._progress.value();
  }

  revalidate(): void {
    if (this._building && !this.getAvailable(this._building.item())) {
      this._building = null;
      this._cost.set(Infinity);

      this._ruleRegistry.process(BuildingCancelled, this);
    }
  }
}

export default CityBuild;
