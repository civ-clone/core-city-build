import { IBuildable as Buildable } from '../Buildable';
import CityBuild from '../CityBuild';
import Rule from '@civ-clone/core-rule/Rule';
/**
 * The progress a build keeps when what it builds changes from one item to another: `CityBuild#build` asks it with the
 * build, the item it was building, the item it is changing to and the progress it had, and sets the progress to the
 * first answer. With no rule, or a rule that answers nothing, the progress is kept as it is.
 *
 * `from` and the progress are what the build had before its first change since its progress last went into it
 * (`CityBuild#add`) or it was last checked (`CityBuild#check`), that is, since the start of the turn. So changing
 * twice in a turn is asked from where the turn started, and changing back to the item the turn started with is asked
 * with that item as both `from` and `to`: a rule that takes a share for a change only when the two differ gives the
 * whole progress back. `from` is the item last cleared when the build was building nothing (`cleared()`), or `null`.
 *
 * Not asked for what a build moves on to by itself: the next queued item once one is completed or can no longer be
 * built.
 */
export declare class ProductionChanged extends Rule<
  [CityBuild, Buildable | null, Buildable, number],
  number
> {}
export default ProductionChanged;
