"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CityBuild = void 0;
const AvailableCityBuildItemsRegistry_1 = require("./AvailableCityBuildItemsRegistry");
const DataObject_1 = require("@civ-clone/core-data-object/DataObject");
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const Build_1 = require("./Rules/Build");
const BuildItem_1 = require("./BuildItem");
const Yields_1 = require("./Yields");
const BulidingCancelled_1 = require("./Rules/BulidingCancelled");
const BulidingComplete_1 = require("./Rules/BulidingComplete");
class CityBuild extends DataObject_1.DataObject {
    constructor(city, availableCityBuildItemsRegistry = AvailableCityBuildItemsRegistry_1.instance, ruleRegistry = RuleRegistry_1.instance) {
        super();
        this._building = null;
        this._cost = new Yields_1.BuildProgress(Infinity);
        this._progress = new Yields_1.BuildProgress();
        this._availableCityBuildItemsRegistry = availableCityBuildItemsRegistry;
        this._city = city;
        this._ruleRegistry = ruleRegistry;
        this.addKey('available', 'building', 'city', 'cost', 'progress', 'remaining');
    }
    add(production) {
        this._progress.add(production);
    }
    available() {
        const buildRules = this._ruleRegistry.get(Build_1.default);
        // TODO: this still feels awkward... It's either this, or every rule has to be 'either it isn't this thing we're
        //  checking or it is and it meets the condition' or it's this. It'd be nice to be able to just filter the list in a
        //  more straightforward way...
        return this._availableCityBuildItemsRegistry.filter((BuildItem) => buildRules
            .filter((rule) => rule.validate(this.city(), BuildItem))
            .every((rule) => rule.process(this.city(), BuildItem).validate())).map((available) => new BuildItem_1.default(available, this.city(), this._ruleRegistry));
    }
    build(ItemToBuild) {
        const buildItem = this.getAvailable(ItemToBuild);
        if (!buildItem) {
            throw new TypeError(`Cannot build ${ItemToBuild.name}, it's not available.`);
        }
        this._building = buildItem;
        this._cost.set(this._building.cost().value());
    }
    building() {
        return this._building;
    }
    check() {
        if (this._progress.value() >= this._cost.value() && this._building) {
            const built = this._building.item().build(this._city, this._ruleRegistry);
            this._progress.set(0);
            this._building = null;
            this._cost.set(Infinity);
            this._ruleRegistry.process(BulidingComplete_1.default, this, built);
            return built;
        }
        return null;
    }
    city() {
        return this._city;
    }
    cost() {
        return this._cost;
    }
    getAvailable(Item) {
        return this.available().filter((available) => available.item() === Item)[0];
    }
    progress() {
        return this._progress;
    }
    remaining() {
        return this._cost.value() - this._progress.value();
    }
    revalidate() {
        if (this._building && !this.getAvailable(this._building.item())) {
            this._building = null;
            this._cost.set(Infinity);
            this._ruleRegistry.process(BulidingCancelled_1.default, this);
        }
    }
}
exports.CityBuild = CityBuild;
exports.default = CityBuild;
//# sourceMappingURL=CityBuild.js.map