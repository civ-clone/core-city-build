import Build from '../Rules/Build';
import { IBuildable as Buildable } from '../Buildable';
/**
 * The rules in `rules` that could apply to `Item`, in the order `rules` has
 * them: those that declared no items, and those that declared `Item` or one it
 * extends (`Build#mayApplyTo`).
 *
 * `CityBuild#available` checks every item against every rule, for every city
 * the computer players consider each turn, and almost every one of those
 * checks is a rule about some other item. The answer for an item only depends
 * on the rules, so it is worked out once per item and kept for as long as the
 * list is: `RuleRegistry#get` hands back the same array until a rule is
 * registered, unregistered, enabled or disabled, and a new one after, so
 * holding the index against the array means it never outlives the rules it
 * was built from, with nothing to invalidate.
 */
export declare const buildRulesFor: (
  rules: Build[],
  Item: Buildable
) => Build[];
export default buildRulesFor;
