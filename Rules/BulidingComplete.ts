import CityBuild from '../CityBuild';
import CityImprovement from '@civ-clone/core-city-improvement/CityImprovement';
import { IRuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import Rule from '@civ-clone/core-rule/Rule';
import Unit from '@civ-clone/core-unit/Unit';

export type ICompletedBuildItem = Unit | CityImprovement;

export class BuildingComplete extends Rule<
  [CityBuild, ICompletedBuildItem],
  void
> {}

export default BuildingComplete;

export interface IBuildingCompleteRegistry
  extends IRuleRegistry<
    BuildingComplete,
    [CityBuild, ICompletedBuildItem],
    void
  > {}
