import {
  RuleRegistry,
  instance as ruleRegistryInstance,
} from '@civ-clone/core-rule/RuleRegistry';
import { IBuildable as Buildable } from '../Buildable';
import BuildCategory from '../Rules/BuildCategory';

/** The category `item` belongs to: the first `BuildCategory` rule's answer, or `null` with none. */
export const buildCategory = (
  item: Buildable,
  ruleRegistry: RuleRegistry = ruleRegistryInstance
): string | null => {
  const [category] = ruleRegistry.process(BuildCategory, item);

  return category ?? null;
};

export default buildCategory;
