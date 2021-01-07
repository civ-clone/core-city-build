"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdditionalData = void 0;
const CityBuildRegistry_1 = require("../CityBuildRegistry");
const AdditionalData_1 = require("@civ-clone/core-data-object/AdditionalData");
const City_1 = require("@civ-clone/core-city/City");
const getAdditionalData = (cityBuildRegistry = CityBuildRegistry_1.instance) => [
    new AdditionalData_1.default(City_1.default, 'build', (city) => cityBuildRegistry.getByCity(city)),
];
exports.getAdditionalData = getAdditionalData;
exports.default = exports.getAdditionalData;
//# sourceMappingURL=build.js.map