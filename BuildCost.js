"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _BuildCost_value;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuildCost = void 0;
const DataObject_1 = require("@civ-clone/core-data-object/DataObject");
// TODO: `BuildCost` could be something other than `Production` (e.g. `Faith`) but omit that need for now.
class BuildCost extends DataObject_1.default {
    constructor(value) {
        super();
        _BuildCost_value.set(this, void 0);
        this.addKey('value');
        __classPrivateFieldSet(this, _BuildCost_value, value, "f");
    }
    value() {
        return __classPrivateFieldGet(this, _BuildCost_value, "f");
    }
}
exports.BuildCost = BuildCost;
_BuildCost_value = new WeakMap();
exports.default = BuildCost;
//# sourceMappingURL=BuildCost.js.map