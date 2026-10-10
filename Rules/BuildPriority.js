"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuildPriority = void 0;
const Rule_1 = require("@civ-clone/core-rule/Rule");
// How much a city needs an item it could build: what a city on Auto, or a computer player, builds next
//  (civ-clone/web-renderer#194). The matches are added together (`lib/rankBuildItems`). An item no rule scores above 0
//  is never chosen this way, so a ruleset scores only what is worth building in the city as it is now. The city's
//  yields come worked out once for every item ranked, as they aren't cheap.
class BuildPriority extends Rule_1.default {
}
exports.BuildPriority = BuildPriority;
exports.default = BuildPriority;
//# sourceMappingURL=BuildPriority.js.map