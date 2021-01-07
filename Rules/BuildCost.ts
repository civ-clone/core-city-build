import City from '@civ-clone/core-city/City';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import { IConstructor } from '@civ-clone/core-registry/Registry';
import { IRuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import Rule from '@civ-clone/core-rule/Rule';
import Yield from '@civ-clone/core-yield/Yield';

// TODO: potentially make a BuildItem class that can be used instead of IConstructor

export class BuildCost extends Rule<[IConstructor, City], number | Yield> {}

export default BuildCost;

export interface IBuildCostRegistry
  extends IRuleRegistry<BuildCost, [IConstructor, City], number | Yield> {}

export const buildCost = (Item: IConstructor, cost: number): BuildCost[] => [
  new BuildCost(
    new Criterion((CheckItem: IConstructor): boolean => CheckItem === Item),
    new Effect((): number => cost)
  ),
];
