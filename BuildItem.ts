import {
  instance as ruleRegistryInstance,
  RuleRegistry,
} from '@civ-clone/core-rule/RuleRegistry';
import BuildCost from './BuildCost';
import BuildCostModifier from './Rules/BuildCostModifier';
import BuildCostRule from './Rules/BuildCost';
import City from '@civ-clone/core-city/City';
import DataObject from '@civ-clone/core-data-object/DataObject';
import { IBuildable as Buildable } from './Buildable';

export class BuildItem extends DataObject {
  static readonly transient = ['_ruleRegistry'];
  private _city: City | null;
  private _cost: BuildCost = new BuildCost(Infinity);
  private _item: Buildable;
  private _ruleRegistry: RuleRegistry;

  constructor(
    item: Buildable,
    city: City | null = null,
    ruleRegistry: RuleRegistry = ruleRegistryInstance
  ) {
    super();

    this._item = item;
    this._city = city;
    this._ruleRegistry = ruleRegistry;

    this.addKey('cost', 'item');
  }

  cost(): BuildCost {
    if (!Number.isFinite(this._cost.value())) {
      const [cost] = this._ruleRegistry.process(
        BuildCostRule,
        this,
        this._city
      );

      if (cost) {
        this._cost = this.modify(cost);
      }
    }

    return this._cost;
  }

  item(): Buildable {
    return this._item;
  }

  // Validated against the cost each modifier would receive: a criterion sees the same value its effect does.
  private modify(cost: BuildCost): BuildCost {
    const modifiers = this._ruleRegistry.get(BuildCostModifier);
    if (modifiers.length === 0) {
      return cost;
    }

    return new BuildCost(
      modifiers.reduce(
        (value: number, modifier: BuildCostModifier): number =>
          modifier.validate(this, this._city, value)
            ? modifier.process(this, this._city, value) ?? value
            : value,
        cost.value()
      )
    );
  }
}

export default BuildItem;
