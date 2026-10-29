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

export class BuildPreferencesRegistry {
  // Weak, so a finished game's players aren't kept for the next.
  #preferences: WeakMap<Player, IBuildPreferences> = new WeakMap();

  get(player: Player): IBuildPreferences {
    return {
      firstBuild: false,
      repeat: false,
      ...this.#preferences.get(player),
    };
  }

  set(player: Player, preferences: Partial<IBuildPreferences>): void {
    this.#preferences.set(player, {
      ...this.get(player),
      ...preferences,
    });
  }
}

export const instance: BuildPreferencesRegistry =
  new BuildPreferencesRegistry();

export default BuildPreferencesRegistry;
