# core-city-build

The repo contains the `CityBuild` and associated objects that deal with building items in `City`s.

__Note__: this should be set up using `yarn` as `npm` can't figure out a usable set of modules.

## Held builds

A ruleset's `Hold` rules keep a city from completing an item it has paid for, while their criteria are met
(`Rules/Hold.ts`).

- `CityBuild#held()` gives the ids of the rules holding the item the city is building, whatever its progress. It is
  sent with each build.
- `CityBuild#heldFor(Item)` gives the ids of the rules that would hold the city's build of `Item`, whether or not the
  city is building it, for the city as it is now: for a build menu or queue to say, beside the item, that it would
  wait. It isn't sent; a client asks it for the items it shows. Beside a queued item it can be wrong either way, as the
  city may have changed by the time it is reached.
- Each time `CityBuild#check()` doesn't complete a build that is paid for because it is held, the `BuildingHeld` rules
  are processed, with the build, the item and those ids: in play, every turn the build waits. Nothing is saved for it,
  so telling a player once is for whoever listens.

## Carry-over, categories and changing what is built

With none of these rules registered, a build works as it always has: a completed item's progress goes back to 0, and a
change of item keeps the progress.

- `BuildOverflow` rules (`Rules/BuildOverflow.ts`) say how much progress a completed item leaves for the next one:
  `progress - cost` to carry the excess over.
- `BuildCategory` rules (`Rules/BuildCategory.ts`) put an item in a category of the ruleset's own ('unit', 'wonder'…);
  `lib/buildCategory` gives it, or `null`.
- `ProductionChanged` rules (`Rules/ProductionChanged.ts`) say what progress a change of item keeps. They are asked
  from what the build had before its first change of the turn, so changing back gives the progress back. That is kept
  on the build only while it differs from the progress, and forgotten when production goes in (`add`) or the build is
  checked (`check`), so a build that has had no such change saves exactly as before. It is also dropped when the build
  is cancelled or cleared (a capture), and once anything else sets the progress (a sabotage). A rule that answers nothing
  keeps the progress, except that a change back to the item the turn started with restores what it had then. They are
  not asked when the build moves on to its next queued item by itself.

An item that should never complete, and turn each turn's progress into something else (gold, say), needs no rule of its
own: give it no cost and a `Hold` rule that always holds it, and a `BuildingHeld` rule, processed at every `check`,
does the conversion and sets the progress back to 0.

## TODO

Add a generic `RushProduction` mechanism that could, for some type of `Yield`, complete production of the currently in-
progress item. It would need to return the cost for completion of the current item and there could be multiple available
(e.g. sacrifice population, spend `Gold`, spend `Faith`) and it should be selectable by the `Player`.
