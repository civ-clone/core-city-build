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
var _CityBuild_availableCityBuildItemsRegistry, _CityBuild_building, _CityBuild_city, _CityBuild_cost, _CityBuild_progress, _CityBuild_ruleRegistry;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CityBuild = void 0;
const AvailableCityBuildItemsRegistry_1 = require("./AvailableCityBuildItemsRegistry");
const Build_1 = require("./Rules/Build");
const BulidingCancelled_1 = require("./Rules/BulidingCancelled");
const BulidingComplete_1 = require("./Rules/BulidingComplete");
const DataObject_1 = require("@civ-clone/core-data-object/DataObject");
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const BuildItem_1 = require("./BuildItem");
const Yields_1 = require("./Yields");
class CityBuild extends DataObject_1.DataObject {
    constructor(city, availableCityBuildItemsRegistry = AvailableCityBuildItemsRegistry_1.instance, ruleRegistry = RuleRegistry_1.instance) {
        super();
        _CityBuild_availableCityBuildItemsRegistry.set(this, void 0);
        _CityBuild_building.set(this, null);
        _CityBuild_city.set(this, void 0);
        _CityBuild_cost.set(this, new Yields_1.BuildProgress(Infinity));
        _CityBuild_progress.set(this, new Yields_1.BuildProgress());
        _CityBuild_ruleRegistry.set(this, void 0);
        __classPrivateFieldSet(this, _CityBuild_availableCityBuildItemsRegistry, availableCityBuildItemsRegistry, "f");
        __classPrivateFieldSet(this, _CityBuild_city, city, "f");
        __classPrivateFieldSet(this, _CityBuild_ruleRegistry, ruleRegistry, "f");
        this.addKey('available', 'building', 'city', 'cost', 'progress', 'remaining');
    }
    add(production) {
        __classPrivateFieldGet(this, _CityBuild_progress, "f").add(production);
    }
    available() {
        const buildRules = __classPrivateFieldGet(this, _CityBuild_ruleRegistry, "f").get(Build_1.Build);
        // TODO: this still feels awkward... It's either this, or every rule has to be 'either it isn't this thing we're
        //  checking or it is and it meets the condition' or it's this. It'd be nice to be able to just filter the list in a
        //  more straightforward way...
        //  Also, yuck. The mixture of `typeof Buildable` and `IConstructor<Buildable>` sucks here...
        return __classPrivateFieldGet(this, _CityBuild_availableCityBuildItemsRegistry, "f").filter((BuildItem) => buildRules
            .filter((rule) => rule.validate(this.city(), BuildItem))
            .every((rule) => rule
            .process(this.city(), BuildItem)
            .validate())).map((available) => new BuildItem_1.default(available, this.city(), __classPrivateFieldGet(this, _CityBuild_ruleRegistry, "f")));
    }
    build(ItemToBuild) {
        const buildItem = this.getAvailable(ItemToBuild);
        if (!buildItem) {
            throw new TypeError(`Cannot build ${ItemToBuild.name}, it's not available.`);
        }
        __classPrivateFieldSet(this, _CityBuild_building, buildItem, "f");
        __classPrivateFieldGet(this, _CityBuild_cost, "f").set(__classPrivateFieldGet(this, _CityBuild_building, "f").cost().value());
    }
    building() {
        return __classPrivateFieldGet(this, _CityBuild_building, "f");
    }
    // TODO: do this via Rules
    check() {
        if (__classPrivateFieldGet(this, _CityBuild_progress, "f").value() >= __classPrivateFieldGet(this, _CityBuild_cost, "f").value() && __classPrivateFieldGet(this, _CityBuild_building, "f")) {
            const built = __classPrivateFieldGet(this, _CityBuild_building, "f").item().build(__classPrivateFieldGet(this, _CityBuild_city, "f"), __classPrivateFieldGet(this, _CityBuild_ruleRegistry, "f"));
            __classPrivateFieldGet(this, _CityBuild_progress, "f").set(0);
            __classPrivateFieldSet(this, _CityBuild_building, null, "f");
            __classPrivateFieldGet(this, _CityBuild_cost, "f").set(Infinity);
            __classPrivateFieldGet(this, _CityBuild_ruleRegistry, "f").process(BulidingComplete_1.BuildingComplete, this, built);
            return built;
        }
        return null;
    }
    city() {
        return __classPrivateFieldGet(this, _CityBuild_city, "f");
    }
    cost() {
        return __classPrivateFieldGet(this, _CityBuild_cost, "f");
    }
    getAvailable(Item) {
        return this.available().filter((available) => available.item() === Item)[0];
    }
    progress() {
        return __classPrivateFieldGet(this, _CityBuild_progress, "f");
    }
    remaining() {
        return __classPrivateFieldGet(this, _CityBuild_cost, "f").value() - __classPrivateFieldGet(this, _CityBuild_progress, "f").value();
    }
    revalidate() {
        if (__classPrivateFieldGet(this, _CityBuild_building, "f") && !this.getAvailable(__classPrivateFieldGet(this, _CityBuild_building, "f").item())) {
            __classPrivateFieldSet(this, _CityBuild_building, null, "f");
            __classPrivateFieldGet(this, _CityBuild_cost, "f").set(Infinity);
            __classPrivateFieldGet(this, _CityBuild_ruleRegistry, "f").process(BulidingCancelled_1.BuildingCancelled, this);
        }
    }
}
exports.CityBuild = CityBuild;
_CityBuild_availableCityBuildItemsRegistry = new WeakMap(), _CityBuild_building = new WeakMap(), _CityBuild_city = new WeakMap(), _CityBuild_cost = new WeakMap(), _CityBuild_progress = new WeakMap(), _CityBuild_ruleRegistry = new WeakMap();
exports.default = CityBuild;
//# sourceMappingURL=CityBuild.js.map