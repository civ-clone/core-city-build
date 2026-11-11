"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Hold = void 0;
const Rule_1 = require("@civ-clone/core-rule/Rule");
/**
 * Holds a city's build once its progress has reached the cost: while any `Hold` rule's criteria are met for the build
 * and the item it is building, `CityBuild#check` doesn't complete it. Nothing else changes: the item stays chosen, its
 * progress stays and goes on growing, and no `BuildingComplete` rule runs, until a turn on which no rule holds it
 * (civ-clone/web-renderer#959). Only the criteria are asked; an effect is never run.
 *
 * `CityBuild#held` gives the ids of the rules holding a build, so a client can say why the city is waiting:
 *
 * ```ts
 * new Hold(
 *   'civ1-unit:city/hold/settlers-chieftain',
 *   new Criterion((cityBuild, BuildItem) => BuildItem === Settlers),
 *   new Criterion((cityBuild) => cityGrowth.getByCity(cityBuild.city()).size() === 1)
 * )
 * ```
 */
class Hold extends Rule_1.default {
}
exports.Hold = Hold;
exports.default = Hold;
//# sourceMappingURL=Hold.js.map