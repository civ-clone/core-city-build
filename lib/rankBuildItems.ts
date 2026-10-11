import BuildItem from '../BuildItem';
import BuildPriority from '../Rules/BuildPriority';
import CityBuild from '../CityBuild';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import Yield from '@civ-clone/core-yield/Yield';

export interface RankedBuildItem {
  buildItem: BuildItem;
  score: number;
}

// What `cityBuild`'s city needs most, of the items it can build that `include` allows: each item's `BuildPriority`
//  matches added together, times its `weight` (a leader's preferences, 1 for none), highest first. Items scoring 0 or
//  less are left out. Ties go to the cheaper item, then by name, so the same city always ranks the same way. A caller
//  that has the city's `yields` already passes them in.
// Not `localeCompare`, which depends on the host's locale: every client must
// break a tie the same way.
const compareNames = (a: string, b: string): number =>
  a < b ? -1 : a > b ? 1 : 0;

export const rankBuildItems = (
  cityBuild: CityBuild,
  ruleRegistry: RuleRegistry,
  include: (buildItem: BuildItem) => boolean = (): boolean => true,
  weight: (buildItem: BuildItem) => number = (): number => 1,
  available: BuildItem[] = cityBuild.available(),
  yields?: Yield[]
): RankedBuildItem[] => {
  const candidates = available.filter(include);

  if (candidates.length === 0) {
    return [];
  }

  const cityYields = yields ?? cityBuild.city().yields();

  return candidates
    .map(
      (buildItem: BuildItem): RankedBuildItem => ({
        buildItem,
        score:
          ruleRegistry
            .process(BuildPriority, cityBuild, buildItem.item(), cityYields)
            .reduce(
              (total: number, value: number): number => total + value,
              0
            ) * weight(buildItem),
      })
    )
    .filter(({ score }): boolean => score > 0)
    .sort(
      (a: RankedBuildItem, b: RankedBuildItem): number =>
        b.score - a.score ||
        a.buildItem.cost().value() - b.buildItem.cost().value() ||
        compareNames(a.buildItem.item().name, b.buildItem.item().name)
    );
};

export default rankBuildItems;
