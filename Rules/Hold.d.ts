import { IBuildable as Buildable } from '../Buildable';
import CityBuild from '../CityBuild';
import Rule from '@civ-clone/core-rule/Rule';
/**
 * Holds a city's build once its progress has reached the cost: while any `Hold` rule's criteria are met for the build
 * and the item it is building, `CityBuild#check` doesn't complete it. Nothing else changes: the item stays chosen, its
 * progress stays and goes on growing, and no `BuildingComplete` rule runs, until a turn on which no rule holds it
 * (civ-clone/web-renderer#959). Only the criteria are asked; an effect is never run.
 *
 * `CityBuild#held` gives the ids of the rules holding a build, so a client can say why the city is waiting:
 *
 * ```ts
 * new Hold(
 *   'civ1-unit:city/hold/settlers-chieftain',
 *   new Criterion((cityBuild, BuildItem) => BuildItem === Settlers),
 *   new Criterion((cityBuild) => cityGrowth.getByCity(cityBuild.city()).size() === 1)
 * )
 * ```
 */
export declare class Hold extends Rule<[CityBuild, Buildable], void> {}
export default Hold;
