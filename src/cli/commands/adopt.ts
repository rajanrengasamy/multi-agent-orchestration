/**
 * Adopt command - Adds MAO to an existing project
 *
 * Usage: mao adopt [--force]
 *
 * This command:
 * 1. Detects project context (directory name, existing package.json)
 * 2. Prompts for project name confirmation
 * 3. Checks for existing .claude/ directory
 * 4. Copies template files
 * 5. Merges or creates package.json
 * 6. Runs npm install for new dependencies
 * 7. Prints next steps
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import chalk from 'chalk';
import { confirm, input } from '@inquirer/prompts';
import { copyTemplates } from '../utils/copyTemplates.js';
import {
  mergePackageJson,
  createPackageJson,
  hasPackageJson,
} from '../utils/mergePackageJson.js';
import { slugify, slugToDisplayName } from '../utils/prompts.js';

interface AdoptOptions {
  force?: boolean;
}

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
        reject(
          new Error(`Command "${command} ${args.join(' ')}" exited with code ${code}`)
        );
      }
    });

    proc.on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Check if a path exists
 */
function pathExists(filePath: string): boolean {
  try {
    fs.accessSync(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Add MAO to an existing project
 */
export async function adopt(options: AdoptOptions = {}): Promise<void> {
  const { force = false } = options;
  const cwd = process.cwd();
  const defaultName = path.basename(cwd);

  console.log();
  console.log(chalk.blue.bold('MAO') + chalk.dim(' - Multi-Agent Orchestration'));
  console.log(chalk.dim('Adding MAO to existing project'));
  console.log();

  try {
    // Step 1: Detect project context
    const existingPackageJson = await hasPackageJson(cwd);
    const claudeDirExists = pathExists(path.join(cwd, '.claude'));

    console.log(chalk.dim('Detected:'));
    console.log(
      chalk.dim('  Directory:'),
      cwd
    );
    console.log(
      chalk.dim('  package.json:'),
      existingPackageJson ? chalk.green('found') : chalk.yellow('not found')
    );
    console.log(
      chalk.dim('  .claude/:'),
      claudeDirExists ? chalk.yellow('exists') : chalk.dim('not found')
    );
    console.log();

    // Step 2: Prompt for project name
    let projectName: string;
    if (force) {
      projectName = slugToDisplayName(defaultName);
      console.log(chalk.cyan('Project name:'), projectName);
    } else {
      projectName = await input({
        message: 'Project name:',
        default: slugToDisplayName(defaultName),
      });
    }

    const projectSlug = slugify(projectName);
    console.log(chalk.dim('  Package name:'), projectSlug);
    console.log();

    // Step 3: Check for existing .claude/ directory
    if (claudeDirExists && !force) {
      const overwrite = await confirm({
        message: 'MAO config (.claude/) already exists. Overwrite?',
        default: false,
      });

      if (!overwrite) {
        console.log();
        console.log(chalk.yellow('Aborted.'), chalk.dim('Use --force to overwrite.'));
        console.log();
        process.exit(0);
      }
    }

    // Step 4: Copy templates
    console.log(chalk.cyan('Copying MAO templates...'));
    await copyTemplates({
      projectName,
      projectSlug,
      targetDir: cwd,
    });
    console.log(chalk.green('  '), 'Copied .claude/ configuration');
    console.log(chalk.green('  '), 'Copied scripts/');
    console.log(chalk.green('  '), 'Copied src/context/');
    console.log();

    // Step 5: Merge or create package.json
    let needsInstall = false;

    if (existingPackageJson) {
      console.log(chalk.cyan('Merging dependencies into package.json...'));
      const mergeResult = await mergePackageJson(cwd);

      if (mergeResult.error) {
        console.error(chalk.red('Error:'), mergeResult.error);
        process.exit(1);
      }

      if (mergeResult.changed) {
        needsInstall = true;

        if (mergeResult.addedDependencies.length > 0) {
          console.log(
            chalk.green('  '),
            'Added dependencies:',
            mergeResult.addedDependencies.join(', ')
          );
        }
        if (mergeResult.addedDevDependencies.length > 0) {
          console.log(
            chalk.green('  '),
            'Added devDependencies:',
            mergeResult.addedDevDependencies.join(', ')
          );
        }
        if (mergeResult.addedScripts.length > 0) {
          console.log(
            chalk.green('  '),
            'Added scripts:',
            mergeResult.addedScripts.join(', ')
          );
        }
      } else {
        console.log(chalk.dim('  '), 'No new dependencies needed');
      }
    } else {
      console.log(chalk.cyan('Creating package.json...'));
      const createResult = await createPackageJson(cwd, projectSlug);

      if (createResult.error) {
        console.error(chalk.red('Error:'), createResult.error);
        process.exit(1);
      }

      needsInstall = true;
      console.log(chalk.green('  '), 'Created package.json with MAO dependencies');
    }
    console.log();

    // Step 6: Run npm install if needed
    if (needsInstall) {
      console.log(chalk.cyan('Installing dependencies...'));
      console.log();
      await runCommand('npm', ['install'], cwd);
      console.log();
    }

    // Step 7: Create .env from .env.example if needed
    const envPath = path.join(cwd, '.env');
    const envExamplePath = path.join(cwd, '.env.example');
    if (!pathExists(envPath) && pathExists(envExamplePath)) {
      const envContent = fs.readFileSync(envExamplePath, 'utf-8');
      const processedContent = envContent
        .replace(/\$PROJECT_NAME/g, projectName)
        .replace(/\$PROJECT_SLUG/g, projectSlug);
      fs.writeFileSync(envPath, processedContent, 'utf-8');
      console.log(chalk.green('  '), 'Created .env from .env.example');
      console.log();
    }

    // Step 8: Print next steps
    console.log(chalk.green.bold('MAO adopted successfully!'));
    console.log();
    console.log(chalk.cyan('Next steps:'));
    console.log();
    console.log(chalk.dim('  1.'), 'Add your OPENAI_API_KEY to .env');
    console.log(chalk.dim('  2.'), 'Run', chalk.blue('npm run seed-context'), 'to index docs');
    console.log(chalk.dim('  3.'), 'Run', chalk.blue('/setup-project'), 'in Claude Code to customize rules');
    console.log(chalk.dim('  4.'), 'Start developing with Claude Code!');
    console.log();
    console.log(chalk.dim('Available commands:'));
    console.log(chalk.dim('  /develop <section>'), '- Develop features with parallel agents');
    console.log(chalk.dim('  /qa <section>'), '     - Run QA review');
    console.log(chalk.dim('  /setup-project'), '    - Configure project profile');
    console.log();
  } catch (error: unknown) {
    if (error instanceof Error) {
      // Handle user cancellation gracefully
      if (error.message.includes('User force closed')) {
        console.log();
        console.log(chalk.yellow('Aborted.'));
        console.log();
        process.exit(0);
      }
      console.error(chalk.red('Error:'), error.message);
    } else {
      console.error(chalk.red('Error:'), 'An unexpected error occurred');
    }
    process.exit(1);
  }
}
