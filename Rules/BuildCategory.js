"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuildCategory = void 0;
const Rule_1 = require("@civ-clone/core-rule/Rule");
/**
 * The category an item a city builds belongs to, as the ruleset sees it ('unit', 'improvement', 'wonder', or whatever
 * it likes): nothing here knows what any item is. `buildCategory` (`lib/buildCategory`) gives the first answer, or
 * `null` with no rule. A `ProductionChanged` rule can compare the categories of the items changed between.
 */
class BuildCategory extends Rule_1.default {
}
exports.BuildCategory = BuildCategory;
exports.default = BuildCategory;
//# sourceMappingURL=BuildCategory.js.map