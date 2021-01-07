import { CityBuild } from '../CityBuild';
import { IRuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import Rule from '@civ-clone/core-rule/Rule';

export class BuildingCancelled extends Rule<[CityBuild], void> {}

export default BuildingCancelled;

export interface IBuildingCancelledRegistry
  extends IRuleRegistry<BuildingCancelled, [CityBuild], void> {}
