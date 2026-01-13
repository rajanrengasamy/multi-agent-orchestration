/**
 * Package.json merging utilities for CLI
 * Merges MAO dependencies into an existing package.json without overwriting other fields.
 */

import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * Dependencies required by MAO
 */
export const MAO_DEPENDENCIES: Record<string, string> = {
  '@lancedb/lancedb': '^0.9.0',
  dotenv: '^16.4.5',
  openai: '^4.70.0',
  zod: '^3.23.8',
};

/**
 * Dev dependencies required by MAO
 */
export const MAO_DEV_DEPENDENCIES: Record<string, string> = {
  '@types/node': '^22.10.0',
  prettier: '^3.3.3',
  tsx: '^4.19.2',
  typescript: '^5.6.3',
};

/**
 * Scripts added by MAO
 */
export const MAO_SCRIPTS: Record<string, string> = {
  'seed-context': 'npx tsx scripts/seed-context.ts',
  retrieve: 'npx tsx scripts/retrieve-context.ts',
  lint: 'npx prettier --check "src/**/*.ts" "scripts/**/*.ts"',
  format: 'npx prettier --write "src/**/*.ts" "scripts/**/*.ts"',
};

export interface MergeResult {
  /** Whether any changes were made to package.json */
  changed: boolean;
  /** Dependencies that were added */
  addedDependencies: string[];
  /** Dev dependencies that were added */
  addedDevDependencies: string[];
  /** Scripts that were added */
  addedScripts: string[];
  /** Error message if merge failed */
  error?: string;
}

interface PackageJson {
  name?: string;
  version?: string;
  type?: string;
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  [key: string]: unknown;
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
 * Merge MAO configuration into an existing package.json
 * Does not overwrite existing dependencies or scripts
 *
 * @param targetDir - Directory containing package.json
 * @returns Result object indicating what was changed
 */
export async function mergePackageJson(targetDir: string): Promise<MergeResult> {
  const result: MergeResult = {
    changed: false,
    addedDependencies: [],
    addedDevDependencies: [],
    addedScripts: [],
  };

  const packageJsonPath = path.join(targetDir, 'package.json');

  // Check if package.json exists
  const exists = await pathExists(packageJsonPath);
  if (!exists) {
    result.error = 'package.json not found';
    return result;
  }

  try {
    // Read existing package.json
    const content = await fs.readFile(packageJsonPath, 'utf-8');
    const packageJson: PackageJson = JSON.parse(content) as PackageJson;

    // Ensure required sections exist
    if (!packageJson.dependencies) {
      packageJson.dependencies = {};
    }
    if (!packageJson.devDependencies) {
      packageJson.devDependencies = {};
    }
    if (!packageJson.scripts) {
      packageJson.scripts = {};
    }

    // Merge dependencies (don't overwrite existing)
    for (const [name, version] of Object.entries(MAO_DEPENDENCIES)) {
      if (!packageJson.dependencies[name]) {
        packageJson.dependencies[name] = version;
        result.addedDependencies.push(name);
        result.changed = true;
      }
    }

    // Merge devDependencies (don't overwrite existing)
    for (const [name, version] of Object.entries(MAO_DEV_DEPENDENCIES)) {
      if (!packageJson.devDependencies[name]) {
        packageJson.devDependencies[name] = version;
        result.addedDevDependencies.push(name);
        result.changed = true;
      }
    }

    // Merge scripts (don't overwrite existing)
    for (const [name, command] of Object.entries(MAO_SCRIPTS)) {
      if (!packageJson.scripts[name]) {
        packageJson.scripts[name] = command;
        result.addedScripts.push(name);
        result.changed = true;
      }
    }

    // Ensure type is set to module for ESM support
    if (!packageJson.type) {
      packageJson.type = 'module';
      result.changed = true;
    }

    // Write back if changes were made
    if (result.changed) {
      // Sort dependencies alphabetically for cleaner diffs
      packageJson.dependencies = sortObject(packageJson.dependencies);
      packageJson.devDependencies = sortObject(packageJson.devDependencies);

      const updatedContent = JSON.stringify(packageJson, null, 2) + '\n';
      await fs.writeFile(packageJsonPath, updatedContent, 'utf-8');
    }

    return result;
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    result.error = `Failed to merge package.json: ${errorMessage}`;
    return result;
  }
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
 * Create a new package.json with MAO configuration
 *
 * @param targetDir - Directory to create package.json in
 * @param projectName - Name for the package
 * @returns Result object indicating what was created
 */
export async function createPackageJson(
  targetDir: string,
  projectName: string
): Promise<MergeResult> {
  const result: MergeResult = {
    changed: false,
    addedDependencies: Object.keys(MAO_DEPENDENCIES),
    addedDevDependencies: Object.keys(MAO_DEV_DEPENDENCIES),
    addedScripts: Object.keys(MAO_SCRIPTS),
  };

  const packageJsonPath = path.join(targetDir, 'package.json');

  // Check if package.json already exists
  const exists = await pathExists(packageJsonPath);
  if (exists) {
    result.error = 'package.json already exists';
    return result;
  }

  try {
    const packageJson: PackageJson = {
      name: projectName,
      version: '0.1.0',
      description: '',
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

    // Ensure target directory exists
    await fs.mkdir(targetDir, { recursive: true });

    // Write package.json
    const content = JSON.stringify(packageJson, null, 2) + '\n';
    await fs.writeFile(packageJsonPath, content, 'utf-8');
    result.changed = true;

    return result;
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    result.error = `Failed to create package.json: ${errorMessage}`;
    return result;
  }
}

/**
 * Check if package.json exists in a directory
 */
export async function hasPackageJson(targetDir: string): Promise<boolean> {
  const packageJsonPath = path.join(targetDir, 'package.json');
  return pathExists(packageJsonPath);
}
