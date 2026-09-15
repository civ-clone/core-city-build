import BuildCostItem from '../BuildCost';
import BuildItem from '../BuildItem';
import City from '@civ-clone/core-city/City';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import { IBuildable as Buildable } from '../Buildable';
import Rule from '@civ-clone/core-rule/Rule';

export class BuildCost extends Rule<[BuildItem, City | null], BuildCostItem> {}

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
export const buildCost = (
  Item: Buildable,
  cost: number,
  idPrefix?: string
): BuildCost[] => buildCosts([[Item, cost]], idPrefix);

export const buildCosts = (
  itemCosts: [Buildable, number][],
  idPrefix?: string
): BuildCost[] =>
  itemCosts.map(
    ([Item, cost]) =>
      new BuildCost(
        ...(idPrefix
          ? [`${idPrefix}/${(Item as unknown as { name: string }).name}`]
          : []),
        new Criterion(
          (buildItem: BuildItem): boolean => buildItem.item() === Item
        ),
        new Effect((): BuildCostItem => new BuildCostItem(cost))
      )
  );
