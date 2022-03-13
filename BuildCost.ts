import DataObject from '@civ-clone/core-data-object/DataObject';

// TODO: `BuildCost` could be something other than `Production` (e.g. `Faith`) but omit that need for now.
export class BuildCost extends DataObject {
  #value: number;

  constructor(value: number) {
    super();

    this.addKey('value');

    this.#value = value;
  }

  value(): number {
    return this.#value;
  }
}

export default BuildCost;
