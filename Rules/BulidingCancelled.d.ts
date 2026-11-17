import { CityBuild, CityBuildClearedReason } from '../CityBuild';
import { IBuildable as Buildable } from '../Buildable';
import Rule from '@civ-clone/core-rule/Rule';
/**
 * Processed by `CityBuild#cancel` once it has stopped building an item, with the build, the item it stopped building
 * and the reason it was given (`cancelled`, `unavailable`, `captured`, or a ruleset's own), as `BuildingComplete` is
 * processed when an item is completed. Every way a build is dropped goes through `cancel`: `revalidate` too.
 *
 * The item and the reason are given here because the build may no longer say them by the time these rules run: a city
 * on Auto that can no longer build its item has already gone on to its queue, which forgets `cleared()`
 * (civ-clone/web-renderer#978).
 */
export declare class BuildingCancelled extends Rule<
  [CityBuild, Buildable, CityBuildClearedReason],
  void
> {}
export default BuildingCancelled;
