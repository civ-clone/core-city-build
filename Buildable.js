"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Buildable = void 0;
const DataObject_1 = require("@civ-clone/core-data-object/DataObject");
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
class Buildable extends DataObject_1.DataObject {
    static build(city, ruleRegistry = RuleRegistry_1.instance) {
        throw new TypeError('createFromObject: Must be overridden in extending class');
    }
}
exports.Buildable = Buildable;
exports.default = Buildable;
//# sourceMappingURL=Buildable.js.map