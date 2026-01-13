import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {
  mergePackageJson,
  createPackageJson,
  hasPackageJson,
  MAO_DEPENDENCIES,
  MAO_DEV_DEPENDENCIES,
  MAO_SCRIPTS,
} from './mergePackageJson.js';

describe('mergePackageJson utilities', () => {
  let testDir: string;

  beforeEach(async () => {
    // Create a unique temp directory for each test
    testDir = await fs.mkdtemp(path.join(os.tmpdir(), 'mao-test-'));
  });

  afterEach(async () => {
    // Cleanup temp directory
    await fs.rm(testDir, { recursive: true, force: true });
  });

  describe('hasPackageJson', () => {
    it('should return true when package.json exists', async () => {
      await fs.writeFile(
        path.join(testDir, 'package.json'),
        JSON.stringify({ name: 'test' })
      );

      const result = await hasPackageJson(testDir);
      expect(result).toBe(true);
    });

    it('should return false when package.json does not exist', async () => {
      const result = await hasPackageJson(testDir);
      expect(result).toBe(false);
    });
  });

  describe('createPackageJson', () => {
    it('should create a new package.json with MAO config', async () => {
      const result = await createPackageJson(testDir, 'my-project');

      expect(result.changed).toBe(true);
      expect(result.error).toBeUndefined();
      expect(result.addedDependencies).toEqual(Object.keys(MAO_DEPENDENCIES));
      expect(result.addedDevDependencies).toEqual(Object.keys(MAO_DEV_DEPENDENCIES));
      expect(result.addedScripts).toEqual(Object.keys(MAO_SCRIPTS));

      // Verify file was created correctly
      const content = await fs.readFile(path.join(testDir, 'package.json'), 'utf-8');
      const pkg = JSON.parse(content);

      expect(pkg.name).toBe('my-project');
      expect(pkg.version).toBe('1.0.0');
      expect(pkg.type).toBe('module');
      expect(pkg.dependencies).toMatchObject(MAO_DEPENDENCIES);
      expect(pkg.devDependencies).toMatchObject(MAO_DEV_DEPENDENCIES);
      expect(pkg.scripts).toMatchObject(MAO_SCRIPTS);
    });

    it('should fail if package.json already exists', async () => {
      await fs.writeFile(
        path.join(testDir, 'package.json'),
        JSON.stringify({ name: 'existing' })
      );

      const result = await createPackageJson(testDir, 'my-project');

      expect(result.changed).toBe(false);
      expect(result.error).toBe('package.json already exists');
    });

    it('should create parent directories if needed', async () => {
      const nestedDir = path.join(testDir, 'nested', 'project');

      const result = await createPackageJson(nestedDir, 'nested-project');

      expect(result.changed).toBe(true);
      expect(await hasPackageJson(nestedDir)).toBe(true);
    });

    it('should sort dependencies alphabetically', async () => {
      await createPackageJson(testDir, 'test-project');

      const content = await fs.readFile(path.join(testDir, 'package.json'), 'utf-8');
      const pkg = JSON.parse(content);

      const depKeys = Object.keys(pkg.dependencies);
      const sortedKeys = [...depKeys].sort();

      expect(depKeys).toEqual(sortedKeys);
    });
  });

  describe('mergePackageJson', () => {
    it('should merge MAO dependencies into existing package.json', async () => {
      // Create an existing package.json with some deps
      const existingPkg = {
        name: 'existing-project',
        version: '2.0.0',
        dependencies: {
          express: '^4.18.0',
        },
        devDependencies: {
          jest: '^29.0.0',
        },
        scripts: {
          start: 'node index.js',
        },
      };

      await fs.writeFile(
        path.join(testDir, 'package.json'),
        JSON.stringify(existingPkg, null, 2)
      );

      const result = await mergePackageJson(testDir);

      expect(result.changed).toBe(true);
      expect(result.addedDependencies).toContain('@lancedb/lancedb');
      expect(result.addedDependencies).toContain('dotenv');
      expect(result.addedDevDependencies).toContain('tsx');
      expect(result.addedScripts).toContain('seed-context');

      // Verify merged content
      const content = await fs.readFile(path.join(testDir, 'package.json'), 'utf-8');
      const pkg = JSON.parse(content);

      // Original fields preserved
      expect(pkg.name).toBe('existing-project');
      expect(pkg.version).toBe('2.0.0');
      expect(pkg.dependencies.express).toBe('^4.18.0');
      expect(pkg.devDependencies.jest).toBe('^29.0.0');
      expect(pkg.scripts.start).toBe('node index.js');

      // MAO fields added
      expect(pkg.dependencies['@lancedb/lancedb']).toBeDefined();
      expect(pkg.devDependencies.tsx).toBeDefined();
      expect(pkg.scripts['seed-context']).toBeDefined();
    });

    it('should not overwrite existing dependencies', async () => {
      const existingPkg = {
        name: 'test',
        dependencies: {
          zod: '^3.0.0', // Older version already installed
        },
      };

      await fs.writeFile(
        path.join(testDir, 'package.json'),
        JSON.stringify(existingPkg)
      );

      const result = await mergePackageJson(testDir);

      // zod should NOT be in addedDependencies
      expect(result.addedDependencies).not.toContain('zod');

      // Original version should be preserved
      const content = await fs.readFile(path.join(testDir, 'package.json'), 'utf-8');
      const pkg = JSON.parse(content);
      expect(pkg.dependencies.zod).toBe('^3.0.0');
    });

    it('should add type: module if not present', async () => {
      const existingPkg = {
        name: 'test',
        // No type field
      };

      await fs.writeFile(
        path.join(testDir, 'package.json'),
        JSON.stringify(existingPkg)
      );

      await mergePackageJson(testDir);

      const content = await fs.readFile(path.join(testDir, 'package.json'), 'utf-8');
      const pkg = JSON.parse(content);
      expect(pkg.type).toBe('module');
    });

    it('should not modify if type: module already present and no new deps needed', async () => {
      const existingPkg = {
        name: 'test',
        type: 'module',
        dependencies: { ...MAO_DEPENDENCIES },
        devDependencies: { ...MAO_DEV_DEPENDENCIES },
        scripts: { ...MAO_SCRIPTS },
      };

      await fs.writeFile(
        path.join(testDir, 'package.json'),
        JSON.stringify(existingPkg)
      );

      const result = await mergePackageJson(testDir);

      expect(result.changed).toBe(false);
      expect(result.addedDependencies).toHaveLength(0);
      expect(result.addedDevDependencies).toHaveLength(0);
      expect(result.addedScripts).toHaveLength(0);
    });

    it('should fail if package.json does not exist', async () => {
      const result = await mergePackageJson(testDir);

      expect(result.error).toBe('package.json not found');
    });

    it('should handle malformed JSON gracefully', async () => {
      await fs.writeFile(
        path.join(testDir, 'package.json'),
        'not valid json {'
      );

      const result = await mergePackageJson(testDir);

      expect(result.error).toBeDefined();
      expect(result.error).toContain('Failed to merge package.json');
    });

    it('should create dependency sections if they do not exist', async () => {
      const minimalPkg = {
        name: 'minimal',
        version: '1.0.0',
        // No dependencies, devDependencies, or scripts
      };

      await fs.writeFile(
        path.join(testDir, 'package.json'),
        JSON.stringify(minimalPkg)
      );

      const result = await mergePackageJson(testDir);

      expect(result.changed).toBe(true);

      const content = await fs.readFile(path.join(testDir, 'package.json'), 'utf-8');
      const pkg = JSON.parse(content);

      expect(pkg.dependencies).toBeDefined();
      expect(pkg.devDependencies).toBeDefined();
      expect(pkg.scripts).toBeDefined();
    });
  });

  describe('MAO constants', () => {
    it('should have required dependencies defined', () => {
      expect(MAO_DEPENDENCIES).toHaveProperty('@lancedb/lancedb');
      expect(MAO_DEPENDENCIES).toHaveProperty('dotenv');
      expect(MAO_DEPENDENCIES).toHaveProperty('openai');
      expect(MAO_DEPENDENCIES).toHaveProperty('zod');
    });

    it('should have required dev dependencies defined', () => {
      expect(MAO_DEV_DEPENDENCIES).toHaveProperty('@types/node');
      expect(MAO_DEV_DEPENDENCIES).toHaveProperty('tsx');
      expect(MAO_DEV_DEPENDENCIES).toHaveProperty('typescript');
    });

    it('should have required scripts defined', () => {
      expect(MAO_SCRIPTS).toHaveProperty('seed-context');
      expect(MAO_SCRIPTS).toHaveProperty('retrieve');
    });
  });
});
