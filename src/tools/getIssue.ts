import { z } from 'zod';
import { Backlog } from 'backlog-js';
import { buildToolSchema, ToolDefinition } from '../types/tool.js';
import { TranslationHelper } from '../createTranslationHelper.js';
import { IssueSchema } from '../types/zod/backlogOutputDefinition.js';
import { resolveIdOrKey } from '../utils/resolveIdOrKey.js';
import { generatePermalink } from '../utils/generatePermalink.js';

const getIssueInputSchema = buildToolSchema((t) => ({
  issueId: z
    .number()
    .optional()
    .describe(
      t('TOOL_GET_ISSUE_ISSUE_ID', 'The numeric ID of the issue (e.g., 12345)')
    ),
  issueKey: z
    .string()
    .optional()
    .describe(
      t('TOOL_GET_ISSUE_ISSUE_KEY', "The key of the issue (e.g., 'PROJ-123')")
    ),
}));


import { IssueCommentSchema } from '../types/zod/backlogOutputDefinition.js';

// Extend the Issue schema
//    add an array of comments
//    add permalink field

const getIssueToolOutputSchema = IssueSchema.extend({
  comments: z.array(IssueCommentSchema),
  permalink: z.string().url(),
});

export const getIssueTool = (
  backlog: Backlog,
  { t }: TranslationHelper
): ToolDefinition<
  ReturnType<typeof getIssueInputSchema>,
  (typeof getIssueToolOutputSchema)['shape']
> => {
  return {
    name: 'get_issue',
    description: t(
      'TOOL_GET_ISSUE_DESCRIPTION',
      'Returns information and comments about a specific issue'
    ),
    outputSchema: getIssueToolOutputSchema,
    schema: z.object(getIssueInputSchema(t)),
    handler: async ({ issueId, issueKey }) => {
      const key = resolveIdOrKey('issue', { id: issueId, key: issueKey }, t);
      if (!key.ok) {
        throw key.error;
      }

      // Fetch the issue information
      const issue_info = await backlog.getIssue(key.value);

      // Fetch comments to compute the count
      const comments = await backlog.getIssueComments(key.value, {});

      // transform the issue info and comment to issue with comments scheme
      const result = {
        ...issue_info,
        comments: comments ? comments   : [],
        permalink: generatePermalink('issue',issue_info.id),
      };

      return result;
    },
  };
};
