"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Build = void 0;
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Rule_1 = require("@civ-clone/core-rule/Rule");
class Build extends Rule_1.default {
    /**
     * As `Rule`, plus any number of items (the classes themselves, so `Warrior`
     * or `Wonder`) the rule is only ever about:
     *
     * ```ts
     * new Build(
     *   'civ1-unit:city/build/requires-advance/Warrior',
     *   Warrior,
     *   new Criterion((city, BuildItem) => BuildItem === Warrior),
     *   new Effect(…)
     * )
     * ```
     *
     * `CityBuild#available` asks every item about every rule, and a ruleset has
     * a rule or two for most items (a real game has ~100 rules for ~76 items).
     * The criterion is an opaque function, so the only way to know which of
     * those checks cannot succeed is to be told. Declaring an item is that
     * telling: the rule is then only checked for that item, any item that
     * extends it, and nothing else. It is a promise that the rule has nothing
     * to say about anything else (its criterion is `false` there, or its effect
     * would pass), which is why it narrows the criterion rather than replacing
     * it: the criterion still runs, and still decides, for the items the rule
     * is checked for. A rule that declares nothing is checked against every
     * item, as before.
     */
    constructor(...values) {
        super(...values.filter((value) => typeof value !== 'function'));
        const items = values.filter((value) => typeof value === 'function');
        this._appliesTo = items.length ? items : null;
    }
    /**
     * The items this rule is only about, or `null` when it declared none and is
     * checked against every item.
     */
    items() {
        return this._appliesTo === null ? null : [...this._appliesTo];
    }
    /**
     * Whether `Item` is one this rule could apply to: always when the rule
     * declared no items, otherwise when `Item` is, or extends, one that it did.
     */
    mayApplyTo(Item) {
        if (this._appliesTo === null) {
            return true;
        }
        for (let index = 0; index < this._appliesTo.length; index++) {
            if (Item === this._appliesTo[index] ||
                Object.prototype.isPrototypeOf.call(this._appliesTo[index], Item)) {
                return true;
            }
        }
        return false;
    }
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