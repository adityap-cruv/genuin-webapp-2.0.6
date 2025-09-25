// Singleton internal storage that mimics the LocalStorage API, with in-memory fallback for AMP iframes or restricted environments.

class InternalStorage {
  private static instance: InternalStorage;
  private storage: Storage | Map<string, string>;
  private isLocalStorageAvailable: boolean;

  private constructor() {
    this.isLocalStorageAvailable = InternalStorage.checkLocalStorage();
    if (this.isLocalStorageAvailable) {
      this.storage = window.localStorage;
    } else {
      this.storage = new Map<string, string>();
    }
  }

  static getInstance(): InternalStorage {
    if (!InternalStorage.instance) {
      InternalStorage.instance = new InternalStorage();
    }
    return InternalStorage.instance;
  }

  static checkLocalStorage(): boolean {
    try {
      const testKey = "__test__";
      window.localStorage.setItem(testKey, "1");
      window.localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  }

  getItem(key: string): string | null {
    if (this.isLocalStorageAvailable) {
      return (this.storage as Storage).getItem(key);
    } else {
      return (this.storage as Map<string, string>).get(key) ?? null;
    }
  }

  setItem(key: string, value: string): void {
    if (this.isLocalStorageAvailable) {
      (this.storage as Storage).setItem(key, value);
    } else {
      (this.storage as Map<string, string>).set(key, value);
    }
  }

  removeItem(key: string): void {
    if (this.isLocalStorageAvailable) {
      (this.storage as Storage).removeItem(key);
    } else {
      (this.storage as Map<string, string>).delete(key);
    }
  }

  clear(): void {
    if (this.isLocalStorageAvailable) {
      (this.storage as Storage).clear();
    } else {
      (this.storage as Map<string, string>).clear();
    }
  }
}

export default InternalStorage.getInstance();
