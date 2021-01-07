"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.instance = exports.AvailableCityBuildItemsRegistry = void 0;
const ConstructorRegistry_1 = require("@civ-clone/core-registry/ConstructorRegistry");
// export class AvailableCityBuildItemsRegistry extends ConstructorRegistry<IBuildItem> implements IAvailableCityBuildItemsRegistry {
class AvailableCityBuildItemsRegistry extends ConstructorRegistry_1.ConstructorRegistry {
    constructor() {
        // super(Unit, CityImprovement);
        super(Function);
    }
}
exports.AvailableCityBuildItemsRegistry = AvailableCityBuildItemsRegistry;
exports.instance = new AvailableCityBuildItemsRegistry();
exports.default = AvailableCityBuildItemsRegistry;
//# sourceMappingURL=AvailableCityBuildItemsRegistry.js.map