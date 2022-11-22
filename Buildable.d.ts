import {
  DataObject,
  IDataObject,
} from '@civ-clone/core-data-object/DataObject';
import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import City from '@civ-clone/core-city/City';
import { IConstructor } from '@civ-clone/core-registry/Registry';
export interface BuildableInstance extends IDataObject {}
export interface IBuildable extends IConstructor<BuildableInstance> {
  build(city: City, ruleRegistry?: RuleRegistry): BuildableInstance;
}
export declare class Buildable extends DataObject {
  static build(city: City, ruleRegistry?: RuleRegistry): Buildable;
}
export default Buildable;
