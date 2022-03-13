import { Criterion, ICriterion } from '@civ-clone/core-rule/Criterion';
import Buildable from '../Buildable';
import City from '@civ-clone/core-city/City';
import { IRuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import Rule from '@civ-clone/core-rule/Rule';
import { IConstructor } from '@civ-clone/core-registry/Registry';

export interface IBuildCriterion extends ICriterion {
  validate(): boolean;
}

export type BuildArgs = [City, IConstructor<Buildable>];

export class Build extends Rule<BuildArgs, IBuildCriterion> {
  process(city: City, BuildItem: typeof Buildable): IBuildCriterion {
    const criterion = super.process(city, BuildItem);

    if (!(criterion instanceof Criterion)) {
      throw new TypeError('Invalid build rule.');
    }

    return criterion;
  }
}

export default Build;

export interface IBuildRegistry
  extends IRuleRegistry<Build, BuildArgs, IBuildCriterion> {}
