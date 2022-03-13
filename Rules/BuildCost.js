"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildCosts = exports.buildCost = exports.BuildCost = void 0;
const BuildCost_1 = require("../BuildCost");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Rule_1 = require("@civ-clone/core-rule/Rule");
class BuildCost extends Rule_1.default {
}
exports.BuildCost = BuildCost;
exports.default = BuildCost;
const buildCost = (Item, cost) => (0, exports.buildCosts)([[Item, cost]]);
exports.buildCost = buildCost;
const buildCosts = (itemCosts) => itemCosts.map(([Item, cost]) => new BuildCost(new Criterion_1.default((buildItem) => buildItem.item() === Item), new Effect_1.default(() => new BuildCost_1.default(cost))));
exports.buildCosts = buildCosts;
//# sourceMappingURL=BuildCost.js.map