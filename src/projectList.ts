import env from 'env-var';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

// Parse project list from env or CLI args
const argv = yargs(hideBin(process.argv))
  .option('project-list', {
    type: 'array',
    describe: 'List of project IDs to include in the search',
    default: env.get('BACKLOG_PROJECT_LIST').default('all').asArray(','),
  })
  .parseSync();

const projectList = argv.projectList
  .map((id) => parseInt(String(id), 10))
  .filter((id) => !isNaN(id));

export { projectList };
