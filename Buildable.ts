import {
  DataObject,
  IDataObject,
} from '@civ-clone/core-data-object/DataObject';
import {
  RuleRegistry,
  instance as ruleRegistryInstance,
} from '@civ-clone/core-rule/RuleRegistry';
import City from '@civ-clone/core-city/City';

export interface IBuildable extends IDataObject {}

export class Buildable extends DataObject {
  public static build(
    city: City,
    ruleRegistry: RuleRegistry = ruleRegistryInstance
  ): Buildable {
    throw new TypeError(
      'createFromObject: Must be overridden in extending class'
    );
  }
}

export default Buildable;
