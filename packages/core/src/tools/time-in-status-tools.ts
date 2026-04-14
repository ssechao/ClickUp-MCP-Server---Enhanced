import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { createClickUpClient } from '../clickup-client/index.js';
import { createTimeInStatusClient } from '../clickup-client/time-in-status.js';
import { mcpError } from '../utils/error-handling.js';

const clickUpClient = createClickUpClient();
const timeInStatusClient = createTimeInStatusClient(clickUpClient);

export function setupTimeInStatusTools(server: McpServer): void {
  server.tool(
    'clickup_get_task_time_in_status',
    'Get the time a task has spent in each status. Useful for tracking workflow bottlenecks and cycle time analysis.',
    {
      task_id: z.string().describe('The ID of the task to get time in status for'),
    },
    async ({ task_id }) => {
      try {
        const result = await timeInStatusClient.getTaskTimeInStatus(task_id);
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        return mcpError('getting task time in status', error);
      }
    }
  );

  server.tool(
    'clickup_get_bulk_tasks_time_in_status',
    'Get the time multiple tasks have spent in each status. Accepts up to 100 task IDs. Useful for batch workflow analysis.',
    {
      task_ids: z
        .array(z.string())
        .min(1)
        .max(100)
        .describe('Array of task IDs to get time in status for (max 100)'),
    },
    async ({ task_ids }) => {
      try {
        const result = await timeInStatusClient.getBulkTasksTimeInStatus(task_ids);
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        return mcpError('getting bulk tasks time in status', error);
      }
    }
  );
}
