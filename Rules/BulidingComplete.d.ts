import { BuildableInstance } from '../Buildable';
import CityBuild from '../CityBuild';
import Rule from '@civ-clone/core-rule/Rule';
export declare class BuildingComplete extends Rule<
  [CityBuild, BuildableInstance],
  void
> {}
export default BuildingComplete;
