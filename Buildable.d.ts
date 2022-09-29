import {
  DataObject,
  IDataObject,
} from '@civ-clone/core-data-object/DataObject';
import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import City from '@civ-clone/core-city/City';
export interface IBuildable extends IDataObject {}
export declare class Buildable extends DataObject {
  static build(city: City, ruleRegistry?: RuleRegistry): Buildable;
}
export default Buildable;
