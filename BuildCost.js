"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuildCost = void 0;
const DataObject_1 = require("@civ-clone/core-data-object/DataObject");
// TODO: `BuildCost` could be something other than `Production` (e.g. `Faith`) but omit that need for now.
class BuildCost extends DataObject_1.default {
    constructor(value) {
        super();
        this.addKey('value');
        this._value = value;
    }
    value() {
        return this._value;
    }
}
exports.BuildCost = BuildCost;
exports.default = BuildCost;
//# sourceMappingURL=BuildCost.js.map