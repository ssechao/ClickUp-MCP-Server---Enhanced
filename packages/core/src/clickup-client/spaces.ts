import { ClickUpClient } from './index.js';
import { validateResponse, SpacesResponseSchema } from '../schemas/response-schemas.js';

// Space interface based on ClickUp API response
export interface Space {
  id: string;
  name: string;
  private: boolean;
  statuses: any[];
  multiple_assignees: boolean;
  features: {
    due_dates: {
      enabled: boolean;
      start_date: boolean;
      remap_due_dates: boolean;
      remap_closed_due_date: boolean;
    };
    time_tracking: {
      enabled: boolean;
    };
    tags: {
      enabled: boolean;
    };
    time_estimates: {
      enabled: boolean;
    };
    checklists: {
      enabled: boolean;
    };
    custom_fields: {
      enabled: boolean;
    };
    remap_dependencies: {
      enabled: boolean;
    };
    dependency_warning: {
      enabled: boolean;
    };
    portfolios: {
      enabled: boolean;
    };
  };
  archived: boolean;
}

export class SpacesClient {
  private client: ClickUpClient;

  constructor(client: ClickUpClient) {
    this.client = client;
  }

  /**
   * Get spaces from a specific workspace
   * @param workspaceId The ID of the workspace to get spaces from
   * @returns A list of spaces
   */
  async getSpacesFromWorkspace(workspaceId: string): Promise<Space[]> {
    // Use the v2 API endpoint for spaces
    const raw = await this.client.get<unknown>(`/team/${workspaceId}/space`);
    const response = validateResponse(SpacesResponseSchema, raw, 'getSpacesFromWorkspace');
    return response.spaces as Space[];
  }

  /**
   * Get a specific space by ID
   * @param spaceId The ID of the space to get
   * @returns The space details
   */
  async getSpace(spaceId: string): Promise<Space> {
    const response = await this.client.get<Space>(`/space/${spaceId}`);
    return response;
  }

  /**
   * Create a new space in a workspace
   * @param workspaceId The ID of the workspace
   * @param params Space creation parameters
   * @returns The created space
   */
  async createSpace(workspaceId: string, params: { name: string; multiple_assignees?: boolean; features?: Record<string, any> }): Promise<Space> {
    return this.client.post(`/team/${workspaceId}/space`, params);
  }

  /**
   * Update an existing space
   * @param spaceId The ID of the space to update
   * @param params Space update parameters
   * @returns The updated space
   */
  async updateSpace(spaceId: string, params: { name?: string; color?: string; private?: boolean; admin_can_manage?: boolean; multiple_assignees?: boolean; features?: Record<string, any> }): Promise<Space> {
    return this.client.put(`/space/${spaceId}`, params);
  }

  /**
   * Delete a space
   * @param spaceId The ID of the space to delete
   * @returns Success response
   */
  async deleteSpace(spaceId: string): Promise<{ success: boolean }> {
    return this.client.delete(`/space/${spaceId}`);
  }
}

export const createSpacesClient = (client: ClickUpClient): SpacesClient => {
  return new SpacesClient(client);
};
