"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildCost = exports.BuildCost = void 0;
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Rule_1 = require("@civ-clone/core-rule/Rule");
// TODO: potentially make a BuildItem class that can be used instead of IConstructor
class BuildCost extends Rule_1.default {
}
exports.BuildCost = BuildCost;
exports.default = BuildCost;
const buildCost = (Item, cost) => [
    new BuildCost(new Criterion_1.default((CheckItem) => CheckItem === Item), new Effect_1.default(() => cost)),
];
exports.buildCost = buildCost;
//# sourceMappingURL=BuildCost.js.map