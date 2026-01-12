/**
 * Create command - Creates a new MAO project
 *
 * Usage: mao create <project-name>
 *
 * This command:
 * 1. Validates the project name
 * 2. Creates a new directory
 * 3. Copies template files with placeholder replacement
 * 4. Generates package.json
 * 5. Runs npm install
 * 6. Prints next steps
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import chalk from 'chalk';
import { copyTemplates, writePackageJson } from '../utils/copyTemplates.js';
import {
  slugify,
  isValidProjectName,
  getProjectNameError,
  slugToDisplayName,
} from '../utils/prompts.js';

/**
 * Run a command and return a promise
 */
function runCommand(
  command: string,
  args: string[],
  cwd: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, {
      cwd,
      stdio: 'inherit',
      shell: true,
    });

    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command "${command} ${args.join(' ')}" exited with code ${code}`));
      }
    });

    proc.on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Create a new MAO project
 */
export async function create(projectName: string): Promise<void> {
  console.log();
  console.log(chalk.blue.bold('MAO') + chalk.dim(' - Multi-Agent Orchestration'));
  console.log();

  // Validate project name
  if (!isValidProjectName(projectName)) {
    console.error(chalk.red('Error:'), getProjectNameError(projectName));
    process.exit(1);
  }

  // Generate slug for package.json name
  const projectSlug = slugify(projectName);
  const displayName = slugToDisplayName(projectName);

  // Determine target directory (relative to cwd)
  const targetDir = path.resolve(process.cwd(), projectName);

  // Check if directory already exists
  if (fs.existsSync(targetDir)) {
    console.error(
      chalk.red('Error:'),
      `Directory "${projectName}" already exists.`
    );
    console.error(chalk.dim('Choose a different name or delete the existing directory.'));
    process.exit(1);
  }

  console.log(chalk.cyan('Creating project:'), displayName);
  console.log(chalk.dim('  Directory:'), targetDir);
  console.log(chalk.dim('  Package name:'), projectSlug);
  console.log();

  try {
    // Create target directory
    console.log(chalk.dim('Creating directory...'));
    fs.mkdirSync(targetDir, { recursive: true });

    // Copy template files
    console.log(chalk.dim('Copying template files...'));
    await copyTemplates({
      projectName: displayName,
      projectSlug,
      targetDir,
    });

    // Generate package.json
    console.log(chalk.dim('Generating package.json...'));
    await writePackageJson(targetDir, displayName, projectSlug);

    // Run npm install
    console.log(chalk.dim('Installing dependencies...'));
    console.log();
    await runCommand('npm', ['install'], targetDir);
    console.log();

    // Success message
    console.log(chalk.green.bold('Project created successfully!'));
    console.log();
    console.log(chalk.cyan('Next steps:'));
    console.log();
    console.log(chalk.dim('  1.'), `cd ${projectName}`);
    console.log(chalk.dim('  2.'), 'Create .env file with your OPENAI_API_KEY');
    console.log(chalk.dim('  3.'), 'Run npm run seed-context to index docs');
    console.log(chalk.dim('  4.'), 'Start developing with Claude Code!');
    console.log();
    console.log(chalk.dim('Project structure:'));
    console.log(chalk.dim('  .claude/       - Claude Code configuration'));
    console.log(chalk.dim('  docs/          - Project documentation'));
    console.log(chalk.dim('  scripts/       - CLI scripts for context management'));
    console.log(chalk.dim('  src/context/   - VectorDB context infrastructure'));
    console.log(chalk.dim('  journal.md     - Development session log'));
    console.log(chalk.dim('  todo/tasks.md  - Task tracking'));
    console.log();
  } catch (error: unknown) {
    // Clean up on failure
    if (fs.existsSync(targetDir)) {
      try {
        fs.rmSync(targetDir, { recursive: true, force: true });
      } catch {
        // Ignore cleanup errors
      }
    }

    if (error instanceof Error) {
      console.error(chalk.red('Error:'), error.message);
    } else {
      console.error(chalk.red('Error:'), 'An unexpected error occurred');
    }
    process.exit(1);
  }
}
