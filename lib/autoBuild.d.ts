import BuildItem from '../BuildItem';
import CityBuild from '../CityBuild';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
export declare const autoBuild: (
  cityBuild: CityBuild,
  ruleRegistry: RuleRegistry,
  include?: (buildItem: BuildItem) => boolean
) => boolean;
export default autoBuild;
