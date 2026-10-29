"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _BuildPreferencesRegistry_preferences;
Object.defineProperty(exports, "__esModule", { value: true });
exports.instance = exports.BuildPreferencesRegistry = void 0;
class BuildPreferencesRegistry {
    constructor() {
        // Weak, so a finished game's players aren't kept for the next.
        _BuildPreferencesRegistry_preferences.set(this, new WeakMap());
    }
    get(player) {
        return {
            firstBuild: false,
            repeat: false,
            ...__classPrivateFieldGet(this, _BuildPreferencesRegistry_preferences, "f").get(player),
        };
    }
    set(player, preferences) {
        __classPrivateFieldGet(this, _BuildPreferencesRegistry_preferences, "f").set(player, {
            ...this.get(player),
            ...preferences,
        });
    }
}
exports.BuildPreferencesRegistry = BuildPreferencesRegistry;
_BuildPreferencesRegistry_preferences = new WeakMap();
exports.instance = new BuildPreferencesRegistry();
exports.default = BuildPreferencesRegistry;
//# sourceMappingURL=BuildPreferencesRegistry.js.map