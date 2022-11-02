import CityBuild from '../CityBuild';
import Rule from '@civ-clone/core-rule/Rule';
import Buildable from '../Buildable';
export declare class BuildingComplete extends Rule<
  [CityBuild, Buildable],
  void
> {}
export default BuildingComplete;
