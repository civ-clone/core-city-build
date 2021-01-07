"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    privateMap.set(receiver, value);
    return value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
};
var _availableCityBuildItemsRegistry, _building, _city, _cost, _progress, _ruleRegistry;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CityBuild = void 0;
const AvailableCityBuildItemsRegistry_1 = require("./AvailableCityBuildItemsRegistry");
const Build_1 = require("./Rules/Build");
const BuildCost_1 = require("./Rules/BuildCost");
const BulidingCancelled_1 = require("./Rules/BulidingCancelled");
const BulidingComplete_1 = require("./Rules/BulidingComplete");
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const Yields_1 = require("./Yields");
class CityBuild {
    constructor(city, availableCityBuildItemsRegistry = AvailableCityBuildItemsRegistry_1.instance, ruleRegistry = RuleRegistry_1.instance) {
        _availableCityBuildItemsRegistry.set(this, void 0);
        // #building: IBuildItem | null = null;
        _building.set(this, null);
        _city.set(this, void 0);
        _cost.set(this, new Yields_1.BuildProgress(Infinity));
        _progress.set(this, new Yields_1.BuildProgress());
        _ruleRegistry.set(this, void 0);
        __classPrivateFieldSet(this, _availableCityBuildItemsRegistry, availableCityBuildItemsRegistry);
        __classPrivateFieldSet(this, _city, city);
        __classPrivateFieldSet(this, _ruleRegistry, ruleRegistry);
    }
    add(production) {
        __classPrivateFieldGet(this, _progress).add(production);
    }
    // available(): IBuildItem[] {
    available() {
        const buildImprovementRules = __classPrivateFieldGet(this, _ruleRegistry).get(Build_1.Build);
        // TODO: this still feels awkward... It's either this, or every rule has to be 'either it isn't this thing we're
        //  checking or it is and it meets the condition' or it's this. It'd be nice to be able to just filter the list in a
        //  more straightforward way...
        return (__classPrivateFieldGet(this, _availableCityBuildItemsRegistry).filter((BuildItem) => buildImprovementRules
            .filter((rule) => rule.validate(this.city(), BuildItem))
            .every((rule) => rule.process(this.city(), BuildItem).validate())));
    }
    // build(BuildItem: IBuildItem): void {
    build(BuildItem) {
        if (!this.available().some(
        // (Entity: IBuildItem): boolean => Entity === BuildItem
        (Entity) => Entity === BuildItem)) {
            throw new TypeError(`Cannot build ${BuildItem.name}, it's not available.`);
        }
        __classPrivateFieldSet(this, _building, BuildItem);
        const [cost] = __classPrivateFieldGet(this, _ruleRegistry).process(BuildCost_1.BuildCost, BuildItem, __classPrivateFieldGet(this, _city));
        __classPrivateFieldGet(this, _cost).set(cost);
    }
    // building(): IBuildItem | null {
    building() {
        return __classPrivateFieldGet(this, _building);
    }
    // TODO: do this via Rules
    check() {
        if (__classPrivateFieldGet(this, _progress).value() >= __classPrivateFieldGet(this, _cost).value()) {
            const built = __classPrivateFieldGet(this, _building).createFromObject({
                city: __classPrivateFieldGet(this, _city),
                player: __classPrivateFieldGet(this, _city).player(),
                ruleRegistry: __classPrivateFieldGet(this, _ruleRegistry),
                tile: __classPrivateFieldGet(this, _city).tile(),
            });
            __classPrivateFieldGet(this, _progress).set(0);
            __classPrivateFieldSet(this, _building, null);
            __classPrivateFieldGet(this, _cost).set(Infinity);
            __classPrivateFieldGet(this, _ruleRegistry).process(BulidingComplete_1.BuildingComplete, this, built);
            return built;
        }
        return null;
    }
    city() {
        return __classPrivateFieldGet(this, _city);
    }
    cost() {
        return __classPrivateFieldGet(this, _cost);
    }
    progress() {
        return __classPrivateFieldGet(this, _progress);
    }
    remaining() {
        return __classPrivateFieldGet(this, _cost).value() - __classPrivateFieldGet(this, _progress).value();
    }
    revalidate() {
        if (!this.available().some(
        // (Entity: IBuildItem): boolean => Entity === this.#building
        (Entity) => Entity === __classPrivateFieldGet(this, _building))) {
            __classPrivateFieldSet(this, _building, null);
            __classPrivateFieldGet(this, _cost).set(Infinity);
            __classPrivateFieldGet(this, _ruleRegistry).process(BulidingCancelled_1.BuildingCancelled, this);
        }
    }
}
exports.CityBuild = CityBuild;
_availableCityBuildItemsRegistry = new WeakMap(), _building = new WeakMap(), _city = new WeakMap(), _cost = new WeakMap(), _progress = new WeakMap(), _ruleRegistry = new WeakMap();
exports.default = CityBuild;
//# sourceMappingURL=CityBuild.js.map