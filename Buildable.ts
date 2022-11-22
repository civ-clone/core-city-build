import {
  DataObject,
  IDataObject,
} from '@civ-clone/core-data-object/DataObject';
import {
  RuleRegistry,
  instance as ruleRegistryInstance,
} from '@civ-clone/core-rule/RuleRegistry';
import City from '@civ-clone/core-city/City';
import { IConstructor } from '@civ-clone/core-registry/Registry';

export interface BuildableInstance extends IDataObject {}

export interface IBuildable extends IConstructor<BuildableInstance> {
  build(city: City, ruleRegistry?: RuleRegistry): BuildableInstance;
}

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
