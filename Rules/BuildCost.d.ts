import City from '@civ-clone/core-city/City';
import { IConstructor } from '@civ-clone/core-registry/Registry';
import { IRuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import Rule from '@civ-clone/core-rule/Rule';
import Yield from '@civ-clone/core-yield/Yield';
export declare class BuildCost extends Rule<
  [IConstructor, City],
  number | Yield
> {}
export default BuildCost;
export interface IBuildCostRegistry
  extends IRuleRegistry<BuildCost, [IConstructor, City], number | Yield> {}
export declare const buildCost: (
  Item: IConstructor,
  cost: number
) => BuildCost[];
