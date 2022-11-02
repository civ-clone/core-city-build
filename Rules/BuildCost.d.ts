import BuildCostItem from '../BuildCost';
import BuildItem from '../BuildItem';
import Buildable from '../Buildable';
import City from '@civ-clone/core-city/City';
import Rule from '@civ-clone/core-rule/Rule';
export declare class BuildCost extends Rule<
  [BuildItem, City | null],
  BuildCostItem
> {}
export default BuildCost;
export declare const buildCost: (
  Item: typeof Buildable,
  cost: number
) => BuildCost[];
export declare const buildCosts: (
  itemCosts: [typeof Buildable, number][]
) => BuildCost[];
