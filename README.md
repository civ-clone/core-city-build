# core-city-build

The repo contains the `CityBuild` and associated objects that deal with building items in `City`s.

__Note__: this should be set up using `yarn` as `npm` can't figure out a usable set of modules.

## Held builds

A ruleset's `Hold` rules keep a city from completing an item it has paid for, while their criteria are met
(`Rules/Hold.ts`).

- `CityBuild#held()` gives the ids of the rules holding the item the city is building, whatever its progress. It is
  sent with each build.
- `CityBuild#held(item)` gives the ids of the rules that would hold the city's build of `item`, whether or not the city
  is building it: for a build menu or queue to say, beside the item, that it would wait. It isn't sent; a client asks it
  for the items it shows.
- When shields added to a build (`CityBuild#add`) pay for its item and the item is held, the `BuildingHeld` rules are
  processed once, with the build, the item and those ids, so a ruleset can announce that it is waiting. Nothing is
  saved for it.

## TODO

Add a generic `RushProduction` mechanism that could, for some type of `Yield`, complete production of the currently in-
progress item. It would need to return the cost for completion of the current item and there could be multiple available
(e.g. sacrifice population, spend `Gold`, spend `Faith`) and it should be selectable by the `Player`.
