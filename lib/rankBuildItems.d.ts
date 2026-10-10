import BuildItem from '../BuildItem';
import CityBuild from '../CityBuild';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import Yield from '@civ-clone/core-yield/Yield';
export interface RankedBuildItem {
  buildItem: BuildItem;
  score: number;
}
export declare const rankBuildItems: (
  cityBuild: CityBuild,
  ruleRegistry: RuleRegistry,
  include?: (buildItem: BuildItem) => boolean,
  weight?: (buildItem: BuildItem) => number,
  available?: BuildItem[],
  yields?: Yield[]
) => RankedBuildItem[];
export default rankBuildItems;
