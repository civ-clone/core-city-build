import BuildCostItem from '../BuildCost';
import BuildItem from '../BuildItem';
import Buildable from '../Buildable';
import City from '@civ-clone/core-city/City';
import { IRuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import Rule from '@civ-clone/core-rule/Rule';
export declare type BuildCostArgs = [BuildItem, City | null];
export declare class BuildCost extends Rule<BuildCostArgs, BuildCostItem> {}
export default BuildCost;
export interface IBuildCostRegistry
  extends IRuleRegistry<BuildCost, BuildCostArgs, BuildCostItem> {}
export declare const buildCost: (
  Item: typeof Buildable,
  cost: number
) => BuildCost[];
export declare const buildCosts: (
  itemCosts: [typeof Buildable, number][]
) => BuildCost[];
