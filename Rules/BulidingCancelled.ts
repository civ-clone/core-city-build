import { CityBuild } from '../CityBuild';
import Rule from '@civ-clone/core-rule/Rule';

export class BuildingCancelled extends Rule<[CityBuild], void> {}

export default BuildingCancelled;
