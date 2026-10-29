import Player from '@civ-clone/core-player/Player';
/**
 * What a player has asked their cities to choose by themselves (civ-clone/web-renderer#690, #691): to build again what
 *  they have just finished (`repeat`), and what a new city starts on (`firstBuild`). The ruleset decides which items
 *  repeat and what a first build is; with neither set, its rules leave the choice to the player. A client's own options,
 *  sent to it each session, so not saved with the game.
 */
export interface IBuildPreferences {
  firstBuild: boolean;
  repeat: boolean;
}
export declare class BuildPreferencesRegistry {
  #private;
  get(player: Player): IBuildPreferences;
  set(player: Player, preferences: Partial<IBuildPreferences>): void;
}
export declare const instance: BuildPreferencesRegistry;
export default BuildPreferencesRegistry;
