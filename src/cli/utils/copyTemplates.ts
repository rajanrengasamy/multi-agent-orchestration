/**
 * Template copying utilities for MAO CLI
 *
 * Handles copying template files from the package to a target project,
 * with placeholder replacement for project-specific values.
 */

import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  MAO_DEPENDENCIES,
  MAO_DEV_DEPENDENCIES,
  MAO_SCRIPTS,
} from './mergePackageJson.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** Files and directories to exclude when copying templates */
const EXCLUDE_PATTERNS = [
  '.DS_Store',
  'node_modules',
  '.git',
  'dist',
  'settings.local.json',
  '.lancedb',
];

/** Files that should have placeholders replaced */
const TEMPLATE_EXTENSIONS = ['.md', '.json', '.ts', '.js', '.yaml', '.yml', '.txt'];

export interface CopyOptions {
  /** Display name for the project (e.g., "My Awesome Project") */
  projectName: string;
  /** URL-friendly slug (e.g., "my-awesome-project") */
  projectSlug: string;
  /** Target directory to copy templates to */
  targetDir: string;
  /** Overwrite existing files (default: false) */
  overwrite?: boolean;
  /** Skip existing files without error (default: true) */
  skipExisting?: boolean;
}

export interface CopyResult {
  /** Files that were copied successfully */
  copied: string[];
  /** Files that were skipped (already exist) */
  skipped: string[];
  /** Files that failed to copy with error messages */
  errors: Array<{ file: string; error: string }>;
}

/**
 * Check if a path should be excluded from copying
 */
function shouldExclude(name: string): boolean {
  return EXCLUDE_PATTERNS.some(
    (pattern) => name === pattern || name.endsWith(pattern)
  );
}

/**
 * Check if a path exists
 */
async function pathExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Replace placeholders in file content
 */
function replacePlaceholders(
  content: string,
  projectName: string,
  projectSlug: string
): string {
  const timestamp = new Date().toISOString();
  return content
    .replace(/\$PROJECT_NAME/g, projectName)
    .replace(/\$PROJECT_SLUG/g, projectSlug)
    .replace(/\$TIMESTAMP/g, timestamp);
}

/**
 * Copy a single file, optionally replacing placeholders
 */
async function copyFileAsync(
  sourcePath: string,
  targetPath: string,
  options: CopyOptions,
  result: CopyResult
): Promise<void> {
  const relativePath = path.relative(options.targetDir, targetPath);
  const ext = path.extname(sourcePath);

  try {
    // Check if destination exists
    const destExists = await pathExists(targetPath);

    if (destExists) {
      if (options.overwrite) {
        // Proceed to overwrite
      } else if (options.skipExisting !== false) {
        // Skip by default
        result.skipped.push(relativePath);
        return;
      } else {
        result.errors.push({
          file: relativePath,
          error: 'File already exists',
        });
        return;
      }
    }

    // Ensure target directory exists
    const targetDir = path.dirname(targetPath);
    await fs.mkdir(targetDir, { recursive: true });

    // Check if this is a template file that needs placeholder replacement
    if (TEMPLATE_EXTENSIONS.includes(ext)) {
      const content = await fs.readFile(sourcePath, 'utf-8');
      const processedContent = replacePlaceholders(
        content,
        options.projectName,
        options.projectSlug
      );
      await fs.writeFile(targetPath, processedContent, 'utf-8');
    } else {
      // Binary file or non-template, copy directly
      await fs.copyFile(sourcePath, targetPath);
    }

    result.copied.push(relativePath);
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    result.errors.push({
      file: relativePath,
      error: errorMessage,
    });
  }
}

/**
 * Recursively copy a directory
 */
async function copyDirectoryAsync(
  sourceDir: string,
  targetDir: string,
  options: CopyOptions,
  result: CopyResult
): Promise<void> {
  try {
    await fs.mkdir(targetDir, { recursive: true });

    const entries = await fs.readdir(sourceDir, { withFileTypes: true });

    for (const entry of entries) {
      if (shouldExclude(entry.name)) {
        continue;
      }

      const sourcePath = path.join(sourceDir, entry.name);
      const targetPath = path.join(targetDir, entry.name);

      if (entry.isDirectory()) {
        await copyDirectoryAsync(sourcePath, targetPath, options, result);
      } else if (entry.isFile()) {
        await copyFileAsync(sourcePath, targetPath, options, result);
      }
    }
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    result.errors.push({
      file: path.relative(options.targetDir, targetDir),
      error: `Failed to copy directory: ${errorMessage}`,
    });
  }
}

/**
 * Get the path to the package's template directory
 * This finds the root of the installed package to locate templates
 */
function getPackageRoot(): string {
  // Navigate from dist/cli/utils to package root
  // In development: src/cli/utils -> src -> root
  // In production: dist/cli/utils -> dist -> root
  let currentDir = __dirname;

  // Walk up to find package.json
  while (currentDir !== path.dirname(currentDir)) {
    if (existsSync(path.join(currentDir, 'package.json'))) {
      return currentDir;
    }
    currentDir = path.dirname(currentDir);
  }

  throw new Error('Could not find package root');
}

/**
 * Copy all template files to the target project directory
 * Returns a result object with lists of copied, skipped, and error files
 */
export async function copyTemplates(options: CopyOptions): Promise<CopyResult> {
  const result: CopyResult = {
    copied: [],
    skipped: [],
    errors: [],
  };

  const { projectName, projectSlug, targetDir } = options;
  const packageRoot = getPackageRoot();
  const templatesDir = path.join(packageRoot, 'templates');

  // Ensure target directory exists
  try {
    await fs.mkdir(targetDir, { recursive: true });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    result.errors.push({
      file: targetDir,
      error: `Failed to create target directory: ${errorMessage}`,
    });
    return result;
  }

  // Copy .claude directory structure from templates/
  const claudeSource = path.join(templatesDir, '.claude');
  const claudeTarget = path.join(targetDir, '.claude');

  if (existsSync(claudeSource)) {
    await copyDirectoryAsync(claudeSource, claudeTarget, options, result);
  }

  // Copy docs directory from templates/ if it exists
  const docsSource = path.join(templatesDir, 'docs');
  const docsTarget = path.join(targetDir, 'docs');

  if (existsSync(docsSource)) {
    await copyDirectoryAsync(docsSource, docsTarget, options, result);
  }

  // Copy scripts directory from templates/
  const scriptsSource = path.join(templatesDir, 'scripts');
  const scriptsTarget = path.join(targetDir, 'scripts');

  if (existsSync(scriptsSource)) {
    await copyDirectoryAsync(scriptsSource, scriptsTarget, options, result);
  }

  // Copy src/context directory from templates/
  const contextSource = path.join(templatesDir, 'src', 'context');
  const contextTarget = path.join(targetDir, 'src', 'context');

  if (existsSync(contextSource)) {
    await copyDirectoryAsync(contextSource, contextTarget, options, result);
  }

  // Copy root config files from templates/
  const rootConfigs = [
    'tsconfig.json',
    '.env.example',
    '.gitignore',
    '.prettierrc',
  ];

  for (const configFile of rootConfigs) {
    const sourcePath = path.join(templatesDir, configFile);
    const targetPath = path.join(targetDir, configFile);

    if (existsSync(sourcePath)) {
      await copyFileAsync(sourcePath, targetPath, options, result);
    }
  }

  // Create empty directories that should exist
  const emptyDirs = ['todo', 'src'];
  for (const dir of emptyDirs) {
    const dirPath = path.join(targetDir, dir);
    if (!existsSync(dirPath)) {
      await fs.mkdir(dirPath, { recursive: true });
    }
  }

  // Create default journal.md
  const journalPath = path.join(targetDir, 'journal.md');
  if (!existsSync(journalPath)) {
    await fs.writeFile(
      journalPath,
      `# ${projectName} Development Journal\n\n## Session Log\n\n`,
      'utf-8'
    );
    result.copied.push('journal.md');
  }

  // Create default todo/tasks.md
  const tasksPath = path.join(targetDir, 'todo', 'tasks.md');
  if (!existsSync(tasksPath)) {
    await fs.writeFile(
      tasksPath,
      `# ${projectName} Tasks\n\n## TODO\n\n- [ ] Initial project setup\n\n`,
      'utf-8'
    );
    result.copied.push('todo/tasks.md');
  }

  return result;
}

/**
 * Copy a specific subdirectory from the package root
 * Useful for copying just .claude, docs, or scripts folders
 */
export async function copySubdirectory(
  subdir: string,
  options: CopyOptions
): Promise<CopyResult> {
  const result: CopyResult = {
    copied: [],
    skipped: [],
    errors: [],
  };

  const packageRoot = getPackageRoot();
  const templatesDir = path.join(packageRoot, 'templates');
  const sourceDir = path.join(templatesDir, subdir);
  const targetDir = path.join(options.targetDir, subdir);

  if (!existsSync(sourceDir)) {
    result.errors.push({
      file: subdir,
      error: `Source directory not found: ${subdir}`,
    });
    return result;
  }

  await copyDirectoryAsync(sourceDir, targetDir, options, result);
  return result;
}

/**
 * Sort object keys alphabetically
 */
function sortObject(obj: Record<string, string>): Record<string, string> {
  const sorted: Record<string, string> = {};
  const keys = Object.keys(obj).sort();
  for (const key of keys) {
    sorted[key] = obj[key];
  }
  return sorted;
}

/**
 * Generate package.json for the new project (async version)
 * Uses shared constants from mergePackageJson.ts to avoid duplication
 */
export async function writePackageJson(
  targetDir: string,
  projectName: string,
  projectSlug: string
): Promise<void> {
  const packageJson = {
    name: projectSlug,
    version: '0.1.0',
    description: `${projectName} - Created with MAO`,
    type: 'module',
    scripts: {
      build: 'tsc',
      test: 'echo "No tests configured yet" && exit 0',
      ...MAO_SCRIPTS,
    },
    dependencies: sortObject(MAO_DEPENDENCIES),
    devDependencies: sortObject(MAO_DEV_DEPENDENCIES),
    engines: {
      node: '>=18.0.0',
    },
  };

  const packageJsonPath = path.join(targetDir, 'package.json');
  await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n', 'utf-8');
}
