import CityBuild from '../CityBuild';
import { IRuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import Rule from '@civ-clone/core-rule/Rule';
import Buildable from '../Buildable';
export declare class BuildingComplete extends Rule<
  [CityBuild, Buildable],
  void
> {}
export default BuildingComplete;
export interface IBuildingCompleteRegistry
  extends IRuleRegistry<BuildingComplete, [CityBuild, Buildable], void> {}
