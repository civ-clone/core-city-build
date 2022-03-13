import BuildCostItem from '../BuildCost';
import BuildItem from '../BuildItem';
import Buildable from '../Buildable';
import City from '@civ-clone/core-city/City';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import { IRuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import Rule from '@civ-clone/core-rule/Rule';

export type BuildCostArgs = [BuildItem, City | null];

export class BuildCost extends Rule<BuildCostArgs, BuildCostItem> {}

export default BuildCost;

export interface IBuildCostRegistry
  extends IRuleRegistry<BuildCost, BuildCostArgs, BuildCostItem> {}

export const buildCost = (Item: typeof Buildable, cost: number): BuildCost[] =>
  buildCosts([[Item, cost]]);

export const buildCosts = (
  itemCosts: [typeof Buildable, number][]
): BuildCost[] =>
  itemCosts.map(
    ([Item, cost]) =>
      new BuildCost(
        new Criterion(
          (buildItem: BuildItem): boolean => buildItem.item() === Item
        ),
        new Effect((): BuildCostItem => new BuildCostItem(cost))
      )
  );
