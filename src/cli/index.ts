#!/usr/bin/env node
/**
 * MAO CLI - Multi-Agent Orchestration for Claude Code
 *
 * Commands:
 *   mao create <project-name>  - Create a new project
 *   mao adopt                  - Add MAO to existing project
 */

import { create } from './commands/create.js';
import { adopt } from './commands/adopt.js';

const args = process.argv.slice(2);
const command = args[0];

async function main(): Promise<void> {
  switch (command) {
    case 'create': {
      const projectName = args[1];
      if (!projectName) {
        console.error('Error: Project name required');
        console.error('Usage: mao create <project-name>');
        process.exit(1);
      }
      await create(projectName);
      break;
    }

    case 'adopt': {
      const forceFlag = args.includes('--force') || args.includes('-f');
      await adopt({ force: forceFlag });
      break;
    }

    case '--help':
    case '-h':
    case undefined:
      showHelp();
      break;

    default:
      console.error(`Unknown command: ${command}`);
      showHelp();
      process.exit(1);
  }
}

function showHelp(): void {
  console.log(`
MAO - Multi-Agent Orchestration for Claude Code

Usage:
  mao create <project-name>   Create a new project
  mao adopt [--force]         Add MAO to existing project
  mao --help                  Show this help message

Options:
  --force, -f                 Skip prompts and overwrite existing files

Examples:
  npx mao create my-project      Create ./my-project/ with MAO setup
  cd existing-project && npx mao adopt
  npx mao adopt --force          Adopt without prompts
`);
}

main().catch((err: unknown) => {
  if (err instanceof Error) {
    console.error('Error:', err.message);
  } else {
    console.error('Error:', err);
  }
  process.exit(1);
});
