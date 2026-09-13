"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuildItem = void 0;
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const BuildCost_1 = require("./BuildCost");
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
                this._cost = cost;
            }
        }
        return this._cost;
    }
    item() {
        return this._item;
    }
}
exports.BuildItem = BuildItem;
BuildItem.transient = ['_ruleRegistry'];
exports.default = BuildItem;
//# sourceMappingURL=BuildItem.js.map