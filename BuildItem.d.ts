import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import BuildCost from './BuildCost';
import Buildable from './Buildable';
import City from '@civ-clone/core-city/City';
import DataObject from '@civ-clone/core-data-object/DataObject';
export declare class BuildItem extends DataObject {
  #private;
  constructor(
    item: typeof Buildable,
    city?: City | null,
    ruleRegistry?: RuleRegistry
  );
  cost(): BuildCost;
  item(): typeof Buildable;
}
export default BuildItem;
