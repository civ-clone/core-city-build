import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import { IBuildable as Buildable } from '../Buildable';
/** The category `item` belongs to: the first `BuildCategory` rule's answer, or `null` with none. */
export declare const buildCategory: (
  item: Buildable,
  ruleRegistry?: RuleRegistry
) => string | null;
export default buildCategory;
