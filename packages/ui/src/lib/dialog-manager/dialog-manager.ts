/**
 * Manages modals to ensure only one is open at a time.
 */
class ModalManager {
  private currentOpenId: string | null = null;
  private registeredModals = new Set<string>();

  /**
   * Registers a modal with the modal manager.
   * @param id - The unique identifier for the modal.
   */
  registerModal(id: string) {
    this.currentOpenId = id;
    this.registeredModals.add(id);
    // No-op for now, but could be used for future features
  }

  /**
   * Unregisters a modal from the modal manager.
   * @param id - The unique identifier of the modal to unregister.
   */
  unregisterModal(id: string) {
    if (this.currentOpenId === id) {
      this.currentOpenId = null;
    }
    this.registeredModals.delete(id);
  }

  /**
   * Returns true if the modal can be opened (no other modal is open or same id).
   */
  canOpenModal(id: string) {
    return this.currentOpenId === null || this.currentOpenId === id;
  }

  /**
   * Notifies the manager that a modal has been opened.
   * @param id - The unique identifier of the modal that has opened.
   * @returns true if opening is allowed, false otherwise.
   */
  notifyModalOpen(id: string) {
    if (this.currentOpenId && this.currentOpenId !== id) {
      // Another modal is already open, do not allow opening
      return false;
    }
    this.currentOpenId = id;
    return true;
  }

  /**
   * Notifies the manager that a modal has been closed.
   * @param id - The unique identifier of the modal that has closed.
   */
  notifyModalClose(id: string) {
    if (this.currentOpenId === id) {
      this.currentOpenId = null;
    }
  }

  /**
   * Returns an array of all currently registered modal IDs.
   */
  getRegisteredModals(): string[] {
    return Array.from(this.registeredModals);
  }
}

/**
 * Singleton instance of the ModalManager.
 */
export const modalManager = new ModalManager();
