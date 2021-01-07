"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.instance = exports.CityBuildRegistry = void 0;
const EntityRegistry_1 = require("@civ-clone/core-registry/EntityRegistry");
const CityBuild_1 = require("./CityBuild");
class CityBuildRegistry extends EntityRegistry_1.EntityRegistry {
    constructor() {
        super(CityBuild_1.default);
    }
    getByCity(city) {
        const cityBuilds = this.getBy('city', city);
        if (cityBuilds.length !== 1) {
            throw new TypeError('Wrong number of entities returned.');
        }
        return cityBuilds[0];
    }
}
exports.CityBuildRegistry = CityBuildRegistry;
exports.instance = new CityBuildRegistry();
exports.default = CityBuildRegistry;
//# sourceMappingURL=CityBuildRegistry.js.map