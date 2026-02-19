interface OfflineAction {
  type: string;
  data: any;
  timestamp: number;
}

class OfflineManager {
  private actions: OfflineAction[] = [];
  private readonly STORAGE_KEY = 'gamblerCup2025_offlineActions';

  constructor() {
    this.loadFromStorage();
    this.setupOnlineListener();
  }

  private loadFromStorage() {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      this.actions = JSON.parse(stored);
    }
  }

  private saveToStorage() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.actions));
  }

  private setupOnlineListener() {
    window.addEventListener('online', () => {
      this.syncOfflineActions();
    });
  }

  addAction(type: string, data: any) {
    const action: OfflineAction = {
      type,
      data,
      timestamp: Date.now(),
    };
    
    this.actions.push(action);
    this.saveToStorage();
    
    // If online, try to sync immediately
    if (navigator.onLine) {
      this.syncOfflineActions();
    }
  }

  private async syncOfflineActions() {
    if (this.actions.length === 0) return;

    try {
      for (const action of this.actions) {
        await this.executeAction(action);
      }
      
      // Clear actions after successful sync
      this.actions = [];
      this.saveToStorage();
    } catch (error) {
      console.error('Error syncing offline actions:', error);
    }
  }

  private async executeAction(action: OfflineAction) {
    const { type, data } = action;
    
    switch (type) {
      case 'UPDATE_SCORE':
        await fetch('/api/scores', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        break;
      case 'CREATE_SIDE_BET':
        await fetch('/api/sidebets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        break;
      case 'UPLOAD_PHOTO':
        await fetch('/api/photos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        break;
    }
  }

  getQueuedActions() {
    return this.actions;
  }
}

export const offlineManager = new OfflineManager();
