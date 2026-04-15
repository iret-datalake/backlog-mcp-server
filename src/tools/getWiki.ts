import { z } from 'zod';
import { Backlog } from 'backlog-js';
import { buildToolSchema, ToolDefinition } from '../types/tool.js';
import { TranslationHelper } from '../createTranslationHelper.js';
import { WikiSchema } from '../types/zod/backlogOutputDefinition.js';
import { generatePermalink } from '../utils/generatePermalink.js';

const getWikiSchema = buildToolSchema((t) => ({
  wikiId: z
    .union([z.string(), z.number()])
    .describe(t('TOOL_GET_WIKI_ID', 'Wiki ID')),
}));

// custom output schema to add permalink field
const getWikiToolOutputSchema = WikiSchema.extend({
  permalink: z.string().url(),
});

export const getWikiTool = (
  backlog: Backlog,
  { t }: TranslationHelper
): ToolDefinition<
  ReturnType<typeof getWikiSchema>,
  (typeof getWikiToolOutputSchema)['shape']
> => {
  return {
    name: 'get_wiki',
    description: t(
      'TOOL_GET_WIKI_DESCRIPTION',
      'Returns information about a specific wiki page'
    ),
    schema: z.object(getWikiSchema(t)),
    outputSchema: getWikiToolOutputSchema,
    importantFields: ['id', 'projectId', 'name', 'content'],
    handler: async ({ wikiId }) => {
      const wikiIdNumber =
        typeof wikiId === 'string' ? parseInt(wikiId, 10) : wikiId;
      return backlog.getWiki(wikiIdNumber).then((wiki) => ({
        ...wiki,
        permalink: generatePermalink('wiki', wiki.id),
      }));
    },
  };
};
