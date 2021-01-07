import { Criterion, ICriterion } from '@civ-clone/core-rule/Criterion';
import City from '@civ-clone/core-city/City';
import { IConstructor } from '@civ-clone/core-registry/Registry';
import { IRuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import Rule from '@civ-clone/core-rule/Rule';

export interface IBuildCriterion extends ICriterion {
  validate(): boolean;
}

export class Build extends Rule<[City, IConstructor], IBuildCriterion> {
  process(city: City, BuildItem: IConstructor): IBuildCriterion {
    const criterion = super.process(city, BuildItem);

    if (!(criterion instanceof Criterion)) {
      throw new TypeError('Invalid build rule.');
    }

    return criterion;
  }
}

export default Build;

export interface IBuildRegistry
  extends IRuleRegistry<Build, [City, IConstructor], IBuildCriterion> {}
