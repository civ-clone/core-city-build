import { Criterion, ICriterion } from '@civ-clone/core-rule/Criterion';
import City from '@civ-clone/core-city/City';
import Effect from '@civ-clone/core-rule/Effect';
import { IBuildable as Buildable } from '../Buildable';
import Priority from '@civ-clone/core-rule/Priority';
import Rule from '@civ-clone/core-rule/Rule';
export interface IBuildCriterion extends ICriterion {
  validate(): boolean;
}
export declare class Build extends Rule<[City, Buildable], IBuildCriterion> {
  private _appliesTo;
  /**
   * As `Rule`, plus any number of items (the classes themselves, so `Warrior`
   * or `Wonder`) the rule is only ever about:
   *
   * ```ts
   * new Build(
   *   'civ1-unit:city/build/requires-advance/Warrior',
   *   Warrior,
   *   new Criterion((city, BuildItem) => BuildItem === Warrior),
   *   new Effect(…)
   * )
   * ```
   *
   * `CityBuild#available` asks every item about every rule, and a ruleset has
   * a rule or two for most items (a real game has ~100 rules for ~76 items).
   * The criterion is an opaque function, so the only way to know which of
   * those checks cannot succeed is to be told. Declaring an item is that
   * telling: the rule is then only checked for that item, any item that
   * extends it, and nothing else. It is a promise that the rule has nothing
   * to say about anything else (its criterion is `false` there, or its effect
   * would pass), which is why it narrows the criterion rather than replacing
   * it: the criterion still runs, and still decides, for the items the rule
   * is checked for. A rule that declares nothing is checked against every
   * item, as before.
   */
  constructor(...values: (string | Priority | Criterion | Effect | Function)[]);
  /**
   * The items this rule is only about, or `null` when it declared none and is
   * checked against every item.
   */
  items(): Function[] | null;
  /**
   * Whether `Item` is one this rule could apply to: always when the rule
   * declared no items, otherwise when `Item` is, or extends, one that it did.
   */
  mayApplyTo(Item: Buildable): boolean;
  process(city: City, BuildItem: Buildable): IBuildCriterion;
}
export default Build;
