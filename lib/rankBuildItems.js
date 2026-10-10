"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rankBuildItems = void 0;
const BuildPriority_1 = require("../Rules/BuildPriority");
// What `cityBuild`'s city needs most, of the items it can build that `include` allows: each item's `BuildPriority`
//  matches added together, times its `weight` (a leader's preferences, 1 for none), highest first. Items scoring 0 or
//  less are left out. Ties go to the cheaper item, then by name, so the same city always ranks the same way. A caller
//  that has the city's `yields` already passes them in.
const rankBuildItems = (cityBuild, ruleRegistry, include = () => true, weight = () => 1, available = cityBuild.available(), yields) => {
    const candidates = available.filter(include);
    if (candidates.length === 0) {
        return [];
    }
    const cityYields = yields !== null && yields !== void 0 ? yields : cityBuild.city().yields();
    return candidates
        .map((buildItem) => ({
        buildItem,
        score: ruleRegistry
            .process(BuildPriority_1.default, cityBuild, buildItem.item(), cityYields)
            .reduce((total, value) => total + value, 0) * weight(buildItem),
    }))
        .filter(({ score }) => score > 0)
        .sort((a, b) => b.score - a.score ||
        a.buildItem.cost().value() - b.buildItem.cost().value() ||
        a.buildItem.item().name.localeCompare(b.buildItem.item().name));
};
exports.rankBuildItems = rankBuildItems;
exports.default = exports.rankBuildItems;
//# sourceMappingURL=rankBuildItems.js.map