import BuildCostItem from '../BuildCost';
import BuildItem from '../BuildItem';
import City from '@civ-clone/core-city/City';
import { IBuildable as Buildable } from '../Buildable';
import Rule from '@civ-clone/core-rule/Rule';
export declare class BuildCost extends Rule<
  [BuildItem, City | null],
  BuildCostItem
> {}
export default BuildCost;
export declare const buildCost: (Item: Buildable, cost: number) => BuildCost[];
export declare const buildCosts: (
  itemCosts: [Buildable, number][]
) => BuildCost[];
