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
/**
 * A cost rule per item.
 *
 * `idPrefix` is optional and names each rule `${idPrefix}/${Item.name}`, so a
 * variant can `replace('civ1-unit:city/build-cost/Warrior', …)` rather than
 * outbid a rule it cannot address. Unit, improvement and wonder costs are among
 * the likeliest things a variant changes, and they are all built here, which
 * is why the id is threaded through the helper rather than left to callers who
 * never see the `new BuildCost(…)` it hides. Without a prefix the rules stay
 * unnamed, exactly as before.
 */
export declare const buildCost: (
  Item: Buildable,
  cost: number,
  idPrefix?: string
) => BuildCost[];
export declare const buildCosts: (
  itemCosts: [Buildable, number][],
  idPrefix?: string
) => BuildCost[];
