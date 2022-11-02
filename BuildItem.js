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
var _BuildItem_city, _BuildItem_cost, _BuildItem_item, _BuildItem_ruleRegistry;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuildItem = void 0;
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const BuildCost_1 = require("./BuildCost");
const BuildCost_2 = require("./Rules/BuildCost");
const DataObject_1 = require("@civ-clone/core-data-object/DataObject");
class BuildItem extends DataObject_1.default {
    constructor(item, city = null, ruleRegistry = RuleRegistry_1.instance) {
        super();
        _BuildItem_city.set(this, void 0);
        _BuildItem_cost.set(this, new BuildCost_1.default(Infinity));
        _BuildItem_item.set(this, void 0);
        _BuildItem_ruleRegistry.set(this, void 0);
        __classPrivateFieldSet(this, _BuildItem_item, item, "f");
        __classPrivateFieldSet(this, _BuildItem_city, city, "f");
        __classPrivateFieldSet(this, _BuildItem_ruleRegistry, ruleRegistry, "f");
        this.addKey('cost', 'item');
    }
    cost() {
        if (!Number.isFinite(__classPrivateFieldGet(this, _BuildItem_cost, "f").value())) {
            const [cost] = __classPrivateFieldGet(this, _BuildItem_ruleRegistry, "f").process(BuildCost_2.default, this, __classPrivateFieldGet(this, _BuildItem_city, "f"));
            if (cost) {
                __classPrivateFieldSet(this, _BuildItem_cost, cost, "f");
            }
        }
        return __classPrivateFieldGet(this, _BuildItem_cost, "f");
    }
    item() {
        return __classPrivateFieldGet(this, _BuildItem_item, "f");
    }
}
exports.BuildItem = BuildItem;
_BuildItem_city = new WeakMap(), _BuildItem_cost = new WeakMap(), _BuildItem_item = new WeakMap(), _BuildItem_ruleRegistry = new WeakMap();
exports.default = BuildItem;
//# sourceMappingURL=BuildItem.js.map