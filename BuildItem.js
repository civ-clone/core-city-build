"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuildItem = void 0;
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const BuildCost_1 = require("./BuildCost");
const BuildCostModifier_1 = require("./Rules/BuildCostModifier");
const BuildCost_2 = require("./Rules/BuildCost");
const DataObject_1 = require("@civ-clone/core-data-object/DataObject");
class BuildItem extends DataObject_1.default {
    constructor(item, city = null, ruleRegistry = RuleRegistry_1.instance) {
        super();
        this._cost = new BuildCost_1.default(Infinity);
        this._item = item;
        this._city = city;
        this._ruleRegistry = ruleRegistry;
        this.addKey('cost', 'item');
    }
    cost() {
        if (!Number.isFinite(this._cost.value())) {
            const [cost] = this._ruleRegistry.process(BuildCost_2.default, this, this._city);
            if (cost) {
                this._cost = this.modify(cost);
            }
        }
        return this._cost;
    }
    item() {
        return this._item;
    }
    // Validated against the cost each modifier would receive: a criterion sees the same value its effect does.
    modify(cost) {
        const modifiers = this._ruleRegistry.get(BuildCostModifier_1.default);
        if (modifiers.length === 0) {
            return cost;
        }
        return new BuildCost_1.default(modifiers.reduce((value, modifier) => {
            var _a;
            return modifier.validate(this, this._city, value)
                ? (_a = modifier.process(this, this._city, value)) !== null && _a !== void 0 ? _a : value
                : value;
        }, cost.value()));
    }
}
exports.BuildItem = BuildItem;
BuildItem.transient = ['_ruleRegistry'];
exports.default = BuildItem;
//# sourceMappingURL=BuildItem.js.map