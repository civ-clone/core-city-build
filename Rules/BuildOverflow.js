"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuildOverflow = void 0;
const Rule_1 = require("@civ-clone/core-rule/Rule");
/**
 * How much progress a build keeps once it completes an item: `CityBuild#check` asks it with the build, the item just
 * built, the progress it had and the item's cost, and starts the next item with the first answer. With no rule, or a
 * rule that answers nothing, the progress goes back to 0.
 *
 * A ruleset that carries the excess over registers one that answers `progress - cost`:
 *
 * ```ts
 * new BuildOverflow(
 *   'my-rules:city/build-overflow/carry-over',
 *   new Effect((cityBuild: CityBuild, item: Buildable, progress: number, cost: number): number => progress - cost)
 * )
 * ```
 */
class BuildOverflow extends Rule_1.default {
}
exports.BuildOverflow = BuildOverflow;
exports.default = BuildOverflow;
//# sourceMappingURL=BuildOverflow.js.map