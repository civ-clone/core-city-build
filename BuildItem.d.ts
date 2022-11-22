import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import BuildCost from './BuildCost';
import City from '@civ-clone/core-city/City';
import DataObject from '@civ-clone/core-data-object/DataObject';
import { IBuildable as Buildable } from './Buildable';
export declare class BuildItem extends DataObject {
  #private;
  constructor(item: Buildable, city?: City | null, ruleRegistry?: RuleRegistry);
  cost(): BuildCost;
  item(): Buildable;
}
export default BuildItem;
