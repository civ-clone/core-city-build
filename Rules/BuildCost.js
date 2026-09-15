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
/**
 * A cost rule per item.
 *
 * `idPrefix` is optional and names each rule `${idPrefix}/${Item.name}`, so a
 * variant can `replace('civ1-unit:city/build-cost/Warrior', …)` rather than
 * outbid a rule it cannot address. Unit, improvement and wonder costs are among
 * the likeliest things a variant changes, and they are all built here, which
 * is why the id is threaded through the helper rather than left to callers who
 * never see the `new BuildCost(…)` it hides. Without a prefix the rules stay
 * unnamed, exactly as before.
 */
const buildCost = (Item, cost, idPrefix) => (0, exports.buildCosts)([[Item, cost]], idPrefix);
exports.buildCost = buildCost;
const buildCosts = (itemCosts, idPrefix) => itemCosts.map(([Item, cost]) => new BuildCost(...(idPrefix
    ? [`${idPrefix}/${Item.name}`]
    : []), new Criterion_1.default((buildItem) => buildItem.item() === Item), new Effect_1.default(() => new BuildCost_1.default(cost))));
exports.buildCosts = buildCosts;
//# sourceMappingURL=BuildCost.js.map