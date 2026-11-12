import { IBuildable as Buildable } from '../Buildable';
import CityBuild from '../CityBuild';
import Rule from '@civ-clone/core-rule/Rule';

/**
 * Processed by `CityBuild#check` each time it doesn't complete a build that is paid for (its progress has reached the
 * cost) because `Hold` rules hold it, with the build, the item and the ids `CityBuild#held` gives
 * (civ-clone/web-renderer#970), as `BuildingComplete` is processed when it does complete one. In play, `check` runs once
 * a turn, so this is processed every turn the build goes on waiting: on the first turn, however it was paid for
 * (production, a purchase, a Caravan's help, a cheaper item chosen with the shields already there), and again on each
 * turn after.
 *
 * Nothing is kept to know whether it has been processed before, so nothing is saved for it, and a build loaded from a
 * save already waiting is processed on its next `check` like any other. Saying it to a player once is up to whoever
 * listens: keep the builds already told of, and forget one once it completes, is cancelled, changes item, or is no
 * longer held.
 *
 * A rule here must not call `check` on the build it is given: the build is still paid for and held, so it would be
 * processed again without end. And since `check` changes nothing before processing these rules, a rule that throws
 * throws again on every later `check`, for as long as the build waits.
 */
export class BuildingHeld extends Rule<
  [CityBuild, Buildable, (string | null)[]],
  void
> {}

export default BuildingHeld;
