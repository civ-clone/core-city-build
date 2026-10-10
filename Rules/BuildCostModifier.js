"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuildCostModifier = void 0;
const Rule_1 = require("@civ-clone/core-rule/Rule");
/**
 * Adjusts a cost a `BuildCost` rule has already set: one city paying more or less for everything, rather than an item
 * costing something different. `BuildItem.cost()` takes the first `BuildCost` result, so a scaling can't be another
 * `BuildCost` rule. Each matching modifier receives the cost the previous one returned, in priority order.
 */
class BuildCostModifier extends Rule_1.default {
}
exports.BuildCostModifier = BuildCostModifier;
exports.default = BuildCostModifier;
//# sourceMappingURL=BuildCostModifier.js.map