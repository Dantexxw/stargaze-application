import { OfflineQueuedAction } from '../types/models';
import { secureStorage } from '../utils/secureStorage';
import { paymentsApi } from '../api/paymentsApi';
import { operationsApi } from '../api/operationsApi';

const OFFLINE_QUEUE_KEY = 'stargaze_offline_action_queue';

class OfflineQueueManager {
  private queue: OfflineQueuedAction[] = [];
  private isProcessing = false;

  constructor() {
    this.loadQueue();
  }

  private async loadQueue(): Promise<void> {
    try {
      const raw = await secureStorage.getItem(OFFLINE_QUEUE_KEY);
      if (raw) {
        this.queue = JSON.parse(raw);
      }
    } catch {
      this.queue = [];
    }
  }

  private async persistQueue(): Promise<void> {
    try {
      await secureStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(this.queue));
    } catch (err) {
      console.warn('[OfflineQueue] Failed to persist queue:', err);
    }
  }

  async enqueueAction(
    type: OfflineQueuedAction['type'],
    payload: Record<string, any>
  ): Promise<OfflineQueuedAction> {
    const action: OfflineQueuedAction = {
      id: 'offline-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
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

  async processQueue(): Promise<{ processed: number; failed: number }> {
    if (this.isProcessing || this.queue.length === 0) {
      return { processed: 0, failed: 0 };
    }

    this.isProcessing = true;
    let processed = 0;
    let failed = 0;

    try {
      const pending = this.queue.filter((a) => a.status === 'QUEUED' || a.status === 'FAILED');

      for (const action of pending) {
        action.status = 'SYNCING';
        await this.persistQueue();

        try {
          switch (action.type) {
            case 'GRANT_VOUCHER':
              await paymentsApi.grantManualVoucher(action.payload as any);
              break;
            case 'ACKNOWLEDGE_ALERT':
              await operationsApi.acknowledgeAlert(action.payload.alertId);
              break;
            default:
              break;
          }

          action.status = 'SYNCED';
          processed++;
        } catch (actionErr) {
          action.retryCount++;
          action.status = action.retryCount >= 5 ? 'FAILED' : 'QUEUED';
          failed++;
          console.warn('[OfflineQueue] Failed to sync ' + action.id + ':', actionErr);
        }
      }

      this.queue = this.queue.filter((a) => a.status !== 'SYNCED');
      await this.persistQueue();
    } finally {
      this.isProcessing = false;
    }

    return { processed, failed };
  }

  getPendingCount(): number {
    return this.queue.filter((a) => a.status === 'QUEUED' || a.status === 'FAILED').length;
  }

  getQueue(): OfflineQueuedAction[] {
    return [...this.queue];
  }
}

export const offlineQueue = new OfflineQueueManager();
export default offlineQueue;
