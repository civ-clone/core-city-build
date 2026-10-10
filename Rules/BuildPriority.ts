import CityBuild from '../CityBuild';
import { IBuildable as Buildable } from '../Buildable';
import Rule from '@civ-clone/core-rule/Rule';
import Yield from '@civ-clone/core-yield/Yield';

// How much a city needs an item it could build: what a city on Auto, or a computer player, builds next
//  (civ-clone/web-renderer#194). The matches are added together (`lib/rankBuildItems`). An item no rule scores above 0
//  is never chosen this way, so a ruleset scores only what is worth building in the city as it is now. The city's
//  yields come worked out once for every item ranked, as they aren't cheap.
export class BuildPriority extends Rule<
  [CityBuild, Buildable, Yield[]],
  number
> {}

export default BuildPriority;
