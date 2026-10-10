import BuildItem from '../BuildItem';
import CityBuild from '../CityBuild';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import rankBuildItems from './rankBuildItems';

// Starts what `cityBuild`'s city needs most (`rankBuildItems`) of what `include` allows, if it's on Auto and building
//  nothing (civ-clone/web-renderer#194). Returns whether it started anything: with nothing ranked, the city is left for
//  its player to choose.
export const autoBuild = (
  cityBuild: CityBuild,
  ruleRegistry: RuleRegistry,
  include: (buildItem: BuildItem) => boolean = (): boolean => true
): boolean => {
  if (!cityBuild.auto() || cityBuild.building() !== null) {
    return false;
  }

  const [best] = rankBuildItems(cityBuild, ruleRegistry, include);

  if (!best) {
    return false;
  }

  cityBuild.build(best.buildItem.item());

  return true;
};

export default autoBuild;
