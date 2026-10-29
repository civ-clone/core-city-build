import BuildPreferencesRegistry from '../BuildPreferencesRegistry';
import Player from '@civ-clone/core-player/Player';
import { expect } from 'chai';

describe('BuildPreferencesRegistry', (): void => {
  it('should have nothing set for a player it has not been told about', (): void => {
    const registry = new BuildPreferencesRegistry();

    expect(registry.get(new Player())).eql({
      firstBuild: false,
      repeat: false,
    });
  });

  it("should keep each player's preferences apart, and change only those given", (): void => {
    const registry = new BuildPreferencesRegistry(),
      player = new Player(),
      other = new Player();

    registry.set(player, { repeat: true });

    expect(registry.get(player)).eql({ firstBuild: false, repeat: true });
    expect(registry.get(other)).eql({ firstBuild: false, repeat: false });

    registry.set(player, { firstBuild: true });

    expect(registry.get(player)).eql({ firstBuild: true, repeat: true });
  });

  it('should hand back a copy, so changing it changes nothing', (): void => {
    const registry = new BuildPreferencesRegistry(),
      player = new Player();

    registry.get(player).repeat = true;

    expect(registry.get(player).repeat).false;
  });
});
