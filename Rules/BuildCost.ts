import BuildCostItem from '../BuildCost';
import BuildItem from '../BuildItem';
import City from '@civ-clone/core-city/City';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import { IBuildable as Buildable } from '../Buildable';
import Rule from '@civ-clone/core-rule/Rule';

export class BuildCost extends Rule<[BuildItem, City | null], BuildCostItem> {}

export default BuildCost;

export const buildCost = (Item: Buildable, cost: number): BuildCost[] =>
  buildCosts([[Item, cost]]);

export const buildCosts = (itemCosts: [Buildable, number][]): BuildCost[] =>
  itemCosts.map(
    ([Item, cost]) =>
      new BuildCost(
        new Criterion(
          (buildItem: BuildItem): boolean => buildItem.item() === Item
        ),
        new Effect((): BuildCostItem => new BuildCostItem(cost))
      )
  );
