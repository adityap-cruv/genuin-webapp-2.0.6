/**
 * Manages a registry of dialogs.
 */
class DialogManager {
  private registeredDialogs = new Set<string>();
  private listeners = new Set<() => void>();

  /**
   * Subscribe to dialog registry changes.
   * @param listener - Callback to invoke on registry changes.
   */
  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener());
  }

  /**
   * Registers a dialog with the dialog manager.
   * @param id - The unique identifier for the dialog.
   */
  registerDialog(id: string) {
    this.registeredDialogs.add(id);
    this.notifyListeners();
  }

  /**
   * Unregisters a dialog from the dialog manager.
   * @param id - The unique identifier of the dialog to unregister.
   */
  unregisterDialog(id: string) {
    this.registeredDialogs.delete(id);
    this.notifyListeners();
  }

  /**
   * Returns an array of all currently registered dialog IDs.
   */
  getRegisteredDialogs(): string[] {
    return Array.from(this.registeredDialogs);
  }
}

/**
 * Singleton instance of the DialogManager.
 */
export const dialogManager = new DialogManager();
