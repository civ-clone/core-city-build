import { IBuildable as Buildable } from '../Buildable';
import Rule from '@civ-clone/core-rule/Rule';
/**
 * The category an item a city builds belongs to, as the ruleset sees it ('unit', 'improvement', 'wonder', or whatever
 * it likes): nothing here knows what any item is. `buildCategory` (`lib/buildCategory`) gives the first answer, or
 * `null` with no rule. A `ProductionChanged` rule can compare the categories of the items changed between.
 */
export declare class BuildCategory extends Rule<[Buildable], string> {}
export default BuildCategory;
