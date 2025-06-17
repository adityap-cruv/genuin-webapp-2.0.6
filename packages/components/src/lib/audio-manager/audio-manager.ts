/**
 * Type definition for a player controller.
 * @property id - The unique identifier for the player.
 * @property control - A function to control the player (e.g., pause it).
 */
type PlayerController = {
  id: string;
  control: () => void;
};

/**
 * Manages audio players to ensure only one plays at a time.
 * When one player starts, others are notified to stop.
 */
class AudioManager {
  private players: Map<string, PlayerController> = new Map();

  /**
   * Registers a new player with the audio manager.
   * @param id - The unique identifier for the player.
   * @param controlFn - The function to call to control (e.g., pause) this player.
   */
  register(id: string, controlFn: () => void) {
    this.players.set(id, { id, control: controlFn });
  }

  /**
   * Unregisters a player from the audio manager.
   * @param id - The unique identifier of the player to unregister.
   */
  unregister(id: string) {
    this.players.delete(id);
  }

  /**
   * Notifies all other registered players to stop when one player starts playing.
   * @param id - The unique identifier of the player that has started playing.
   */
  notifyPlaying(id: string) {
    for (const [otherId, player] of this.players.entries()) {
      if (otherId !== id) {
        player.control();
      }
    }
  }
}

/**
 * Singleton instance of the AudioManager.
 */
export const audioManager = new AudioManager();
