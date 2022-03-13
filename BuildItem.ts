import BuildCost from './BuildCost';
import BuildCostRule from './Rules/BuildCost';
import Buildable from './Buildable';
import City from '@civ-clone/core-city/City';
import DataObject from '@civ-clone/core-data-object/DataObject';
import { IBuildCostRegistry } from './Rules/BuildCost';
import { instance as ruleRegistryInstance } from '@civ-clone/core-rule/RuleRegistry';

export class BuildItem extends DataObject {
  #city: City | null;
  #cost: BuildCost = new BuildCost(Infinity);
  #item: typeof Buildable;
  #ruleRegistry: IBuildCostRegistry;

  constructor(
    item: typeof Buildable,
    city: City | null = null,
    ruleRegistry: IBuildCostRegistry = ruleRegistryInstance
  ) {
    super();

    this.#item = item;
    this.#city = city;
    this.#ruleRegistry = ruleRegistry;

    this.addKey('cost', 'item');
  }

  cost(): BuildCost {
    if (Infinity === this.#cost.value()) {
      const [cost] = (this.#ruleRegistry as IBuildCostRegistry).process(
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

  item(): typeof Buildable {
    return this.#item;
  }
}

export default BuildItem;
