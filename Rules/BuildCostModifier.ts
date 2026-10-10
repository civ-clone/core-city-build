import BuildItem from '../BuildItem';
import City from '@civ-clone/core-city/City';
import Rule from '@civ-clone/core-rule/Rule';

/**
 * Adjusts a cost a `BuildCost` rule has already set: one city paying more or less for everything, rather than an item
 * costing something different. `BuildItem.cost()` takes the first `BuildCost` result, so a scaling can't be another
 * `BuildCost` rule. Each matching modifier receives the cost the previous one returned, in priority order.
 */
export class BuildCostModifier extends Rule<
  [BuildItem, City | null, number],
  number
> {}

export default BuildCostModifier;
