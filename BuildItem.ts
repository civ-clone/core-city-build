import {
  instance as ruleRegistryInstance,
  RuleRegistry,
} from '@civ-clone/core-rule/RuleRegistry';
import BuildCost from './BuildCost';
import BuildCostRule from './Rules/BuildCost';
import City from '@civ-clone/core-city/City';
import DataObject from '@civ-clone/core-data-object/DataObject';
import { IBuildable as Buildable } from './Buildable';

export class BuildItem extends DataObject {
  #city: City | null;
  #cost: BuildCost = new BuildCost(Infinity);
  #item: Buildable;
  #ruleRegistry: RuleRegistry;

  constructor(
    item: Buildable,
    city: City | null = null,
    ruleRegistry: RuleRegistry = ruleRegistryInstance
  ) {
    super();

    this.#item = item;
    this.#city = city;
    this.#ruleRegistry = ruleRegistry;

    this.addKey('cost', 'item');
  }

  cost(): BuildCost {
    if (!Number.isFinite(this.#cost.value())) {
      const [cost] = this.#ruleRegistry.process(
        BuildCostRule,
        this,
        this.#city
      );

      if (cost) {
        this.#cost = cost;
      }
    }

    return this.#cost;
  }

  item(): Buildable {
    return this.#item;
  }
}

export default BuildItem;
