import { IBuildable as Buildable } from '../Buildable';
import CityBuild from '../CityBuild';
import Rule from '@civ-clone/core-rule/Rule';

/**
 * Holds a city's build: while any enabled `Hold` rule's criteria are met for the build and the item it is building,
 * `CityBuild#check` doesn't complete it, however much progress it has. Nothing else changes: the item stays chosen,
 * its progress stays and goes on adding up past the cost, and no `BuildingComplete` rule runs, until a turn on which no
 * rule holds it (civ-clone/web-renderer#959). Only the criteria are asked; an effect is never run.
 *
 * `CityBuild#held` gives the ids of the rules holding a build whatever its progress, so a client can warn that an item
 * will wait before it is paid for (with something still `remaining`), and say why the city is waiting once it is:
 *
 * ```ts
 * new Hold(
 *   'civ1-unit:city/hold/settlers-chieftain',
 *   new Criterion((cityBuild, BuildItem) => BuildItem === Settlers),
 *   new Criterion((cityBuild) => cityGrowth.getByCity(cityBuild.city()).size() === 1)
 * )
 * ```
 *
 * `held` is asked each time a build is sent to a client, so put the cheapest criterion first: `Rule` stops at the first
 * that isn't met.
 */
export class Hold extends Rule<[CityBuild, Buildable], void> {}

export default Hold;
