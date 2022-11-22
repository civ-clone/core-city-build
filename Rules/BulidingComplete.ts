import CityBuild from '../CityBuild';
import { IDataObject } from '@civ-clone/core-data-object/DataObject';
import Rule from '@civ-clone/core-rule/Rule';

export class BuildingComplete extends Rule<[CityBuild, IDataObject], void> {}

export default BuildingComplete;
