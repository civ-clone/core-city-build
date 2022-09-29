# core-city-build

The repo contains the `CityBuild` and associated objects that deal with building items in `City`s.

__Note__: this should be set up using `yarn` as `npm` can't figure out a usable set of modules.

## TODO

Add a generic `RushProduction` mechanism that could, for some type of `Yield`, complete production of the currently in-
progress item. It would need to return the cost for completion of the current item and there could be multiple available
(e.g. sacrifice population, spend `Gold`, spend `Faith`) and it should be selectable by the `Player`.
