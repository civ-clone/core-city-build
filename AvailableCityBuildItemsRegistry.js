"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.instance = exports.AvailableCityBuildItemsRegistry = void 0;
const ConstructorRegistry_1 = require("@civ-clone/core-registry/ConstructorRegistry");
const Buildable_1 = require("./Buildable");
class AvailableCityBuildItemsRegistry extends ConstructorRegistry_1.ConstructorRegistry {
    constructor() {
        super(Buildable_1.default);
    }
}
exports.AvailableCityBuildItemsRegistry = AvailableCityBuildItemsRegistry;
exports.instance = new AvailableCityBuildItemsRegistry();
exports.default = AvailableCityBuildItemsRegistry;
//# sourceMappingURL=AvailableCityBuildItemsRegistry.js.map