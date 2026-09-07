import { OfflineQueuedAction } from '../types/models';
import { rawSecureStore } from '../services/SecureStorage';
import { paymentsApi } from '../api/paymentsApi';
import { operationsApi } from '../api/operationsApi';

const OFFLINE_QUEUE_KEY = 'stargaze_offline_action_queue';

export class OfflineSyncService {
  private static queue: OfflineQueuedAction[] = [];
  private static isSyncing = false;

  /**
   * Initializes queue from persistent storage on app startup
   */
  static async initializeQueue(): Promise<void> {
    try {
      const stored = await rawSecureStore.getItem(OFFLINE_QUEUE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('[OfflineSyncService] Failed to load offline queue:', e);
      this.queue = [];
    }
  }

  /**
   * Enqueues an action when offline or in rural connectivity zones
   */
  static async enqueueAction(
    type: OfflineQueuedAction['type'],
    payload: Record<string, any>
  ): Promise<OfflineQueuedAction> {
    const action: OfflineQueuedAction = {
      id: 'offline-act-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      type,
      payload,
      createdAt: new Date().toISOString(),
      retryCount: 0,
      status: 'QUEUED',
    };

    this.queue.push(action);
    await this.persistQueue();
    return action;
  }

  /**
   * Flushes all queued actions to the backend when online
   */
  static async flushQueue(): Promise<{ synced: number; failed: number }> {
    if (this.isSyncing || this.queue.length === 0) {
      return { synced: 0, failed: 0 };
    }

    this.isSyncing = true;
    let synced = 0;
    let failed = 0;

    const remainingQueue: OfflineQueuedAction[] = [];

    for (const action of this.queue) {
      try {
        if (action.type === 'GRANT_VOUCHER') {
          await paymentsApi.grantManualVoucher(action.payload as any);
        } else if (action.type === 'ACKNOWLEDGE_ALERT') {
          await operationsApi.acknowledgeAlert(action.payload.alertId);
        }
        synced++;
      } catch (err) {
        action.retryCount++;
        if (action.retryCount < 5) {
          remainingQueue.push(action);
        }
        failed++;
      }
    }

    this.queue = remainingQueue;
    await this.persistQueue();
    this.isSyncing = false;

    return { synced, failed };
  }

  static getQueuedCount(): number {
    return this.queue.length;
  }

  private static async persistQueue(): Promise<void> {
    try {
      await rawSecureStore.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(this.queue));
    } catch (e) {
      console.warn('[OfflineSyncService] Failed to persist offline queue:', e);
    }
  }
}

export default OfflineSyncService;
