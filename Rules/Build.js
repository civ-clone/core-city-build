"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Build = void 0;
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Rule_1 = require("@civ-clone/core-rule/Rule");
class Build extends Rule_1.default {
    process(city, BuildItem) {
        const criterion = super.process(city, BuildItem);
        if (!(criterion instanceof Criterion_1.Criterion)) {
            throw new TypeError('Invalid build rule.');
        }
        return criterion;
    }
}
exports.Build = Build;
exports.default = Build;
//# sourceMappingURL=Build.js.map