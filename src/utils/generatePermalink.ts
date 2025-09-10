
/** A utility to generate permalinks for various Backlog resources.
 * @param type - The type of resource: 'issue' | 'wiki' | 'project' | 'repo'
 * @param identifier - The identifier for the resource (issue number, wiki page, project id, etc.)
 * @returns The permalink as a string
 */

import env from 'env-var';
const baseUrl = env.get('BACKLOG_DOMAIN').required().asString();


export function generatePermalink(
	type: 'issue' | 'wiki' | 'project' | 'repo',
	identifier?: string | number
): string {
	switch (type) {
		case 'issue':
			if (!identifier) throw new Error('Issue number required');
			return `https://${baseUrl}/view/${identifier}`;
		case 'wiki':
			if (!identifier) throw new Error('Wiki page name required');
			return `https://${baseUrl}/alias/wiki/${identifier}`;
		case 'project':
			if (!identifier) throw new Error('Project id required');
			return `https://${baseUrl}/projects/${identifier}`;
		case 'repo':
			return `https://${baseUrl}`;
		default:
			throw new Error('Unknown type');
	}
}
