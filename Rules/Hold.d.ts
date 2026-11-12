import { IBuildable as Buildable } from '../Buildable';
import CityBuild from '../CityBuild';
import Rule from '@civ-clone/core-rule/Rule';
/**
 * Holds a city's build: while any enabled `Hold` rule's criteria are met for the build and the item it is building,
 * `CityBuild#check` doesn't complete it, however much progress it has. Nothing else changes: the item stays chosen,
 * its progress stays and goes on adding up past the cost, and no `BuildingComplete` rule runs, until a turn on which no
 * rule holds it (civ-clone/web-renderer#959). Only the criteria are asked; an effect is never run.
 *
 * `CityBuild#held` gives the ids of the rules holding a build whatever its progress, so a client can warn that an item
 * will wait before it is paid for (with something still `remaining`), and say why the city is waiting once it is:
 *
 * ```ts
 * // Something a city can build, and how big a city is: whatever a ruleset has for them.
 * declare const Founder: Buildable;
 * declare const sizeOf: (city: City) => number;
 *
 * new Hold(
 *   'my-rules:city/hold/founder-in-a-small-city',
 *   new Criterion((cityBuild: CityBuild, BuildItem: Buildable) => BuildItem === Founder),
 *   new Criterion((cityBuild: CityBuild) => sizeOf(cityBuild.city()) < 2)
 * )
 * ```
 *
 * Give every `Hold` rule an id: it is all a client has to word the reason, and `held` gives `null` for a rule without
 * one.
 *
 * A criterion reads the item from its second argument. It must not read the build's `building()`, `progress()`,
 * `remaining()` or cost: `CityBuild#heldFor` asks about an item the city isn't building, to say beside it in a build
 * menu or queue that it would wait (civ-clone/web-renderer#970), handing the criterion a build that is building
 * something else, or nothing.
 *
 * Each time `check` doesn't complete a build that is paid for because a `Hold` rule holds it, the `BuildingHeld` rules
 * are processed, so a ruleset can say that it is waiting.
 *
 * `held` is asked each time a build is sent to a client, so put the cheapest criterion first: `Rule` stops at the first
 * that isn't met.
 */
export declare class Hold extends Rule<[CityBuild, Buildable], void> {}
export default Hold;
