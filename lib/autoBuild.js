"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.autoBuild = void 0;
const rankBuildItems_1 = require("./rankBuildItems");
// Starts what `cityBuild`'s city needs most (`rankBuildItems`) of what `include` allows, if it's on Auto and building
//  nothing (civ-clone/web-renderer#194). Returns whether it started anything: with nothing ranked, the city is left for
//  its player to choose.
const autoBuild = (cityBuild, ruleRegistry, include = () => true) => {
    if (!cityBuild.auto() || cityBuild.building() !== null) {
        return false;
    }
    const [best] = (0, rankBuildItems_1.default)(cityBuild, ruleRegistry, include);
    if (!best) {
        return false;
    }
    cityBuild.build(best.buildItem.item());
    return true;
};
exports.autoBuild = autoBuild;
exports.default = exports.autoBuild;
//# sourceMappingURL=autoBuild.js.map