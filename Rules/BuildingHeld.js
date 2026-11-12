"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuildingHeld = void 0;
const Rule_1 = require("@civ-clone/core-rule/Rule");
/**
 * Processed once, when shields added to a build (`CityBuild#add`: production, a purchase, a Caravan's help) pay for
 * the item it is building and `Hold` rules then hold it: the moment the build starts waiting, with the item and the ids
 * `CityBuild#held` gives (civ-clone/web-renderer#970). A ruleset announces it from here, as it announces a completed
 * build from `BuildingComplete`.
 *
 * Nothing is saved for it: it is worked out from the progress before and after the shields are added, so it isn't
 * processed again on the turns the build goes on waiting, nor for a build that completes (nothing holds it), nor for
 * one paid for some other way (a cheaper item chosen with the shields already there, a new price). A build that is
 * paid for again after its progress is emptied (a Diplomat's sabotage) is processed again.
 */
class BuildingHeld extends Rule_1.default {
}
exports.BuildingHeld = BuildingHeld;
exports.default = BuildingHeld;
//# sourceMappingURL=BuildingHeld.js.map