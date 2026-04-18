/* eslint-disable no-console */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { createClickUpClient } from '../clickup-client/index.js';
import { createSpacesClient } from '../clickup-client/spaces.js';
import { mcpError } from '../utils/error-handling.js';

// Create clients
const clickUpClient = createClickUpClient();
const spacesClient = createSpacesClient(clickUpClient);

export function setupSpaceTools(server: McpServer): void {
  // Register get_spaces tool
  server.tool(
    'clickup_get_spaces',
    'Get spaces from a ClickUp workspace. Returns space details including name, settings, and features.',
    { workspace_id: z.string().describe('The ID of the workspace to get spaces from') },
    async ({ workspace_id }) => {
      try {
        console.error(`[SpaceTools] Getting spaces for workspace ${workspace_id}...`);
        const spaces = await spacesClient.getSpacesFromWorkspace(workspace_id);
        console.error(`[SpaceTools] Got ${spaces.length} spaces`);

        return {
          content: [{ type: 'text', text: JSON.stringify(spaces, null, 2) }],
        };
      } catch (error: unknown) {
        return mcpError('getting spaces', error);
      }
    }
  );

  // Register get_space tool
  server.tool(
    'clickup_get_space',
    'Get details about a specific ClickUp space. Returns space name, settings, features, and metadata.',
    { space_id: z.string().describe('The ID of the space to get') },
    async ({ space_id }) => {
      try {
        console.error(`[SpaceTools] Getting space ${space_id}...`);
        const space = await spacesClient.getSpace(space_id);
        console.error(`[SpaceTools] Got space: ${space.name}`);

        return {
          content: [{ type: 'text', text: JSON.stringify(space, null, 2) }],
        };
      } catch (error: unknown) {
        return mcpError('getting space', error);
      }
    }
  );

  server.tool(
    'clickup_create_space',
    'Create a new space in a ClickUp workspace.',
    {
      workspace_id: z.string().describe('The ID of the workspace to create the space in'),
      name: z.string().describe('The name of the space'),
      multiple_assignees: z.boolean().optional().describe('Allow multiple assignees on tasks (default: false)'),
    },
    async ({ workspace_id, name, multiple_assignees }) => {
      try {
        const params: { name: string; multiple_assignees?: boolean } = { name };
        if (multiple_assignees !== undefined) params.multiple_assignees = multiple_assignees;
        const space = await spacesClient.createSpace(workspace_id, params);
        return {
          content: [{ type: 'text', text: JSON.stringify(space, null, 2) }],
        };
      } catch (error: unknown) {
        return mcpError('creating space', error);
      }
    }
  );

  server.tool(
    'clickup_update_space',
    'Update an existing ClickUp space (name, color, privacy, features).',
    {
      space_id: z.string().describe('The ID of the space to update'),
      name: z.string().optional().describe('New name for the space'),
      color: z.string().optional().describe('Color hex code (e.g. "#0091ff")'),
      private: z.boolean().optional().describe('Whether the space is private'),
      admin_can_manage: z.boolean().optional().describe('Whether admins can manage this space'),
      multiple_assignees: z.boolean().optional().describe('Allow multiple assignees on tasks'),
    },
    async ({ space_id, name, color, private: isPrivate, admin_can_manage, multiple_assignees }) => {
      try {
        const params: Record<string, any> = {};
        if (name !== undefined) params.name = name;
        if (color !== undefined) params.color = color;
        if (isPrivate !== undefined) params.private = isPrivate;
        if (admin_can_manage !== undefined) params.admin_can_manage = admin_can_manage;
        if (multiple_assignees !== undefined) params.multiple_assignees = multiple_assignees;
        const space = await spacesClient.updateSpace(space_id, params);
        return {
          content: [{ type: 'text', text: JSON.stringify(space, null, 2) }],
        };
      } catch (error: unknown) {
        return mcpError('updating space', error);
      }
    }
  );

  server.tool(
    'clickup_delete_space',
    '⚠️ DESTRUCTIVE: Delete a space from ClickUp. This permanently removes the space and ALL its contents (folders, lists, tasks).',
    {
      space_id: z.string().describe('The ID of the space to delete'),
      confirm_deletion: z.boolean().describe('Must be true to confirm this destructive operation'),
    },
    async ({ space_id, confirm_deletion }) => {
      try {
        if (!confirm_deletion) {
          return {
            content: [{ type: 'text', text: '❌ Space deletion cancelled. Set confirm_deletion to true to proceed.' }],
            isError: true,
          };
        }
        const spaceDetails = await spacesClient.getSpace(space_id);
        await spacesClient.deleteSpace(space_id);
        return {
          content: [{ type: 'text', text: `✅ Space "${spaceDetails.name}" (ID: ${space_id}) has been permanently deleted.\n\n⚠️ This action cannot be undone.` }],
        };
      } catch (error: unknown) {
        return mcpError('deleting space', error);
      }
    }
  );
}
