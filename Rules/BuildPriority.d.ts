import CityBuild from '../CityBuild';
import { IBuildable as Buildable } from '../Buildable';
import Rule from '@civ-clone/core-rule/Rule';
import Yield from '@civ-clone/core-yield/Yield';
export declare class BuildPriority extends Rule<
  [CityBuild, Buildable, Yield[]],
  number
> {}
export default BuildPriority;
