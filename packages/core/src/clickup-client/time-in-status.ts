import { ClickUpClient } from './index.js';

export interface StatusTime {
  status: string;
  color: string;
  total_time: number;
  orderindex: number;
  type: string;
}

export interface TaskTimeInStatus {
  current_status: {
    status: string;
    color: string;
    total_time: number;
    type: string;
  };
  status_history: StatusTime[];
}

export interface BulkTaskTimeInStatus {
  [taskId: string]: TaskTimeInStatus;
}

export class TimeInStatusClient {
  private client: ClickUpClient;

  constructor(client: ClickUpClient) {
    this.client = client;
  }

  /**
   * Get time a task has spent in each status
   * @param taskId The ID of the task
   * @returns Time spent in each status
   */
  async getTaskTimeInStatus(taskId: string): Promise<TaskTimeInStatus> {
    return this.client.get(`/task/${taskId}/time_in_status`);
  }

  /**
   * Get time multiple tasks have spent in each status
   * @param taskIds Array of task IDs (max 100)
   * @returns Time spent in each status for each task
   */
  async getBulkTasksTimeInStatus(taskIds: string[]): Promise<BulkTaskTimeInStatus> {
    const params = new URLSearchParams();
    for (const id of taskIds) {
      params.append('task_ids', id);
    }
    return this.client.get(`/task/bulk_time_in_status/task_ids?${params.toString()}`);
  }
}

export const createTimeInStatusClient = (client: ClickUpClient): TimeInStatusClient => {
  return new TimeInStatusClient(client);
};
