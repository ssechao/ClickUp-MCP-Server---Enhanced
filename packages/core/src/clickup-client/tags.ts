import { ClickUpClient } from './index.js';

export interface Tag {
  name: string;
  tag_fg: string;
  tag_bg: string;
  creator?: number;
}

export interface SpaceTag extends Tag {
  creator: number;
}

export interface GetSpaceTagsResponse {
  tags: SpaceTag[];
}

export class TagsClient {
  private client: ClickUpClient;

  constructor(client: ClickUpClient) {
    this.client = client;
  }

  /**
   * Get all tags from a space
   * @param spaceId The ID of the space
   * @returns List of tags in the space
   */
  async getSpaceTags(spaceId: string): Promise<GetSpaceTagsResponse> {
    return this.client.get(`/space/${spaceId}/tag`);
  }

  /**
   * Create a tag in a space
   * @param spaceId The ID of the space
   * @param tag The tag to create
   * @returns The created tag
   */
  async createSpaceTag(spaceId: string, tag: Tag): Promise<void> {
    return this.client.post(`/space/${spaceId}/tag`, { tag });
  }

  /**
   * Update a tag in a space
   * @param spaceId The ID of the space
   * @param tagName The current name of the tag
   * @param tag The updated tag data
   */
  async updateSpaceTag(spaceId: string, tagName: string, tag: Tag): Promise<void> {
    return this.client.put(`/space/${spaceId}/tag/${encodeURIComponent(tagName)}`, { tag });
  }

  /**
   * Delete a tag from a space
   * @param spaceId The ID of the space
   * @param tagName The name of the tag to delete
   */
  async deleteSpaceTag(spaceId: string, tagName: string): Promise<void> {
    return this.client.delete(`/space/${spaceId}/tag/${encodeURIComponent(tagName)}`);
  }

  /**
   * Add a tag to a task
   * @param taskId The ID of the task
   * @param tagName The name of the tag to add
   */
  async addTagToTask(taskId: string, tagName: string): Promise<void> {
    return this.client.post(`/task/${taskId}/tag/${encodeURIComponent(tagName)}`);
  }

  /**
   * Remove a tag from a task
   * @param taskId The ID of the task
   * @param tagName The name of the tag to remove
   */
  async removeTagFromTask(taskId: string, tagName: string): Promise<void> {
    return this.client.delete(`/task/${taskId}/tag/${encodeURIComponent(tagName)}`);
  }
}

export const createTagsClient = (client: ClickUpClient): TagsClient => {
  return new TagsClient(client);
};
