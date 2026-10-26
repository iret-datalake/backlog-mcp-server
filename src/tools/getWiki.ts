import { z } from 'zod';
import type { Entity } from 'backlog-js';
import { getWiki } from 'backlog-js';
import type { Client } from 'backlog-js';
import { buildToolSchema, ToolDefinition } from '../types/tool.js';
import { outputFields } from '../types/outputFields.js';
import { DescriptionHelper } from '../createDescriptionHelper.js';
import { generatePermalink } from '../utils/generatePermalink.js';

type WikiWithPermalink = Entity.Wiki.Wiki & { permalink: string };

const getWikiSchema = buildToolSchema((t) => ({
  wikiId: z
    .union([z.string(), z.number()])
    .describe(t('TOOL_GET_WIKI_ID', 'Wiki ID')),
}));

export const getWikiTool = (
  backlog: Client,
  { t }: DescriptionHelper
): ToolDefinition<ReturnType<typeof getWikiSchema>, WikiWithPermalink> => {
  return {
    name: 'get_wiki',
    description: t(
      'TOOL_GET_WIKI_DESCRIPTION',
      'Returns information about a specific wiki page'
    ),
    schema: z.object(getWikiSchema(t)),
    returnsList: false,
    outputFields: outputFields<WikiWithPermalink>()([
      'id',
      'projectId',
      'name',
      'content',
      'tags',
      'attachments',
      'sharedFiles',
      'stars',
      'createdUser',
      'created',
      'updatedUser',
      'updated',
      'permalink',
    ]),
    importantFields: ['id', 'projectId', 'name', 'content'],
    handler: async ({ wikiId }) => {
      const wikiIdNumber =
        typeof wikiId === 'string' ? parseInt(wikiId, 10) : wikiId;
      const wiki = await getWiki(backlog, wikiIdNumber);
      return { ...wiki, permalink: generatePermalink('wiki', wiki.id) };
    },
  };
};
