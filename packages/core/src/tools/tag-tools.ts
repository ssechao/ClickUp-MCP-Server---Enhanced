import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { createClickUpClient } from '../clickup-client/index.js';
import { createTagsClient } from '../clickup-client/tags.js';
import { mcpError } from '../utils/error-handling.js';

const clickUpClient = createClickUpClient();
const tagsClient = createTagsClient(clickUpClient);

export function setupTagTools(server: McpServer): void {
  server.tool(
    'clickup_get_space_tags',
    'Get all tags defined in a ClickUp space.',
    {
      space_id: z.string().describe('The ID of the space to get tags from'),
    },
    async ({ space_id }) => {
      try {
        const result = await tagsClient.getSpaceTags(space_id);
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        return mcpError('getting space tags', error);
      }
    }
  );

  server.tool(
    'clickup_create_space_tag',
    'Create a new tag in a ClickUp space. The tag can then be added to tasks in that space.',
    {
      space_id: z.string().describe('The ID of the space to create the tag in'),
      name: z.string().describe('The name of the tag'),
      tag_fg: z.string().optional().describe('Foreground color hex (e.g. "#ffffff")'),
      tag_bg: z.string().optional().describe('Background color hex (e.g. "#ff0000")'),
    },
    async ({ space_id, name, tag_fg, tag_bg }) => {
      try {
        await tagsClient.createSpaceTag(space_id, {
          name,
          tag_fg: tag_fg || '',
          tag_bg: tag_bg || '',
        });
        return {
          content: [{ type: 'text', text: `Tag "${name}" created successfully in space ${space_id}.` }],
        };
      } catch (error: unknown) {
        return mcpError('creating space tag', error);
      }
    }
  );

  server.tool(
    'clickup_update_space_tag',
    'Update an existing tag in a ClickUp space (rename or change colors).',
    {
      space_id: z.string().describe('The ID of the space containing the tag'),
      tag_name: z.string().describe('The current name of the tag to update'),
      new_name: z.string().describe('The new name for the tag'),
      tag_fg: z.string().optional().describe('New foreground color hex (e.g. "#ffffff")'),
      tag_bg: z.string().optional().describe('New background color hex (e.g. "#ff0000")'),
    },
    async ({ space_id, tag_name, new_name, tag_fg, tag_bg }) => {
      try {
        await tagsClient.updateSpaceTag(space_id, tag_name, {
          name: new_name,
          tag_fg: tag_fg || '',
          tag_bg: tag_bg || '',
        });
        return {
          content: [{ type: 'text', text: `Tag "${tag_name}" updated to "${new_name}" in space ${space_id}.` }],
        };
      } catch (error: unknown) {
        return mcpError('updating space tag', error);
      }
    }
  );

  server.tool(
    'clickup_delete_space_tag',
    'Delete a tag from a ClickUp space. This removes the tag from all tasks in the space.',
    {
      space_id: z.string().describe('The ID of the space containing the tag'),
      tag_name: z.string().describe('The name of the tag to delete'),
    },
    async ({ space_id, tag_name }) => {
      try {
        await tagsClient.deleteSpaceTag(space_id, tag_name);
        return {
          content: [{ type: 'text', text: `Tag "${tag_name}" deleted from space ${space_id}.` }],
        };
      } catch (error: unknown) {
        return mcpError('deleting space tag', error);
      }
    }
  );

  server.tool(
    'clickup_add_tag_to_task',
    'Add an existing tag to a ClickUp task. The tag must already exist in the space.',
    {
      task_id: z.string().describe('The ID of the task to add the tag to'),
      tag_name: z.string().describe('The name of the tag to add'),
    },
    async ({ task_id, tag_name }) => {
      try {
        await tagsClient.addTagToTask(task_id, tag_name);
        return {
          content: [{ type: 'text', text: `Tag "${tag_name}" added to task ${task_id}.` }],
        };
      } catch (error: unknown) {
        return mcpError('adding tag to task', error);
      }
    }
  );

  server.tool(
    'clickup_remove_tag_from_task',
    'Remove a tag from a ClickUp task.',
    {
      task_id: z.string().describe('The ID of the task to remove the tag from'),
      tag_name: z.string().describe('The name of the tag to remove'),
    },
    async ({ task_id, tag_name }) => {
      try {
        await tagsClient.removeTagFromTask(task_id, tag_name);
        return {
          content: [{ type: 'text', text: `Tag "${tag_name}" removed from task ${task_id}.` }],
        };
      } catch (error: unknown) {
        return mcpError('removing tag from task', error);
      }
    }
  );
}
