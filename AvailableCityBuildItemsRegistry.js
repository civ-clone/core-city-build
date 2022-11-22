"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.instance = exports.AvailableCityBuildItemsRegistry = void 0;
const EntityRegistry_1 = require("@civ-clone/core-registry/EntityRegistry");
class AvailableCityBuildItemsRegistry extends EntityRegistry_1.EntityRegistry {
    constructor() {
        // All `Buildable`s are `Function`s so this is sufficient although less than ideal
        // @ts-ignore
        super(Function);
    }
    accepts(entity) {
        return Object.prototype.hasOwnProperty.call(entity, 'build');
    }
}
exports.AvailableCityBuildItemsRegistry = AvailableCityBuildItemsRegistry;
exports.instance = new AvailableCityBuildItemsRegistry();
exports.default = AvailableCityBuildItemsRegistry;
//# sourceMappingURL=AvailableCityBuildItemsRegistry.js.map