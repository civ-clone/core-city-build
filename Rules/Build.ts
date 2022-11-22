import { Criterion, ICriterion } from '@civ-clone/core-rule/Criterion';
import City from '@civ-clone/core-city/City';
import { IBuildable as Buildable } from '../Buildable';
import Rule from '@civ-clone/core-rule/Rule';

export interface IBuildCriterion extends ICriterion {
  validate(): boolean;
}

export class Build extends Rule<[City, Buildable], IBuildCriterion> {
  process(city: City, BuildItem: Buildable): IBuildCriterion {
    const criterion = super.process(city, BuildItem);

    if (!(criterion instanceof Criterion)) {
      throw new TypeError('Invalid build rule.');
    }

    return criterion;
  }
}

export default Build;
