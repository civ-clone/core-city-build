import DataObject from '@civ-clone/core-data-object/DataObject';
export declare class BuildCost extends DataObject {
  private _value;
  constructor(value: number);
  value(): number;
}
export default BuildCost;
