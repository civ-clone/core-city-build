"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildCategory = void 0;
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const BuildCategory_1 = require("../Rules/BuildCategory");
/** The category `item` belongs to: the first `BuildCategory` rule's answer, or `null` with none. */
const buildCategory = (item, ruleRegistry = RuleRegistry_1.instance) => {
    const [category] = ruleRegistry.process(BuildCategory_1.default, item);
    return category !== null && category !== void 0 ? category : null;
};
exports.buildCategory = buildCategory;
exports.default = exports.buildCategory;
//# sourceMappingURL=buildCategory.js.map