/**
 * Integration tests for MAO CLI
 *
 * These tests verify the full end-to-end behavior of the CLI commands,
 * ensuring that template copying, package.json merging, and VectorDB
 * configuration work correctly when installed as an npm package.
 *
 * These tests would have caught:
 * - Template path resolution bug (templates not found in npm package)
 * - VectorDB global path bug (DB stored in ~ instead of project root)
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { copyTemplates, writePackageJson } from './utils/copyTemplates.js';
import { mergePackageJson, createPackageJson } from './utils/mergePackageJson.js';
import { DEFAULT_CONFIG } from '../context/types.js';

describe('MAO CLI Integration Tests', () => {
  let testDir: string;

  beforeEach(async () => {
    // Create a unique temp directory for each test
    testDir = path.join(os.tmpdir(), `mao-integration-test-${Date.now()}`);
    await fs.mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    // Clean up temp directory
    if (testDir && existsSync(testDir)) {
      await fs.rm(testDir, { recursive: true, force: true });
    }
  });

  describe('VectorDB Configuration', () => {
    it('should use project-local path for VectorDB (not global home directory)', () => {
      // CRITICAL: This test ensures VectorDB is stored in the project, not globally
      // Bug history: Previously used ~/.{project}/context/lancedb which:
      // - Made projects non-portable
      // - Caused collisions between projects
      // - Confused users about where data was stored

      expect(DEFAULT_CONFIG.dbPath).toBe('./.lancedb');
      expect(DEFAULT_CONFIG.dbPath).not.toContain(os.homedir());
      expect(DEFAULT_CONFIG.dbPath).not.toContain('process.env');
      expect(DEFAULT_CONFIG.dbPath).not.toContain('HOME');
    });

    it('should not require PROJECT_SLUG environment variable', () => {
      // The path should work without any environment variables
      const dbPath = DEFAULT_CONFIG.dbPath;

      // Should be a simple relative path
      expect(dbPath.startsWith('./')).toBe(true);
      expect(dbPath).not.toContain('$');
      expect(dbPath).not.toContain('process.env');
    });
  });

  describe('Template Copying (copyTemplates)', () => {
    it('should copy all required directories', async () => {
      const result = await copyTemplates({
        projectName: 'Test Project',
        projectSlug: 'test-project',
        targetDir: testDir,
      });

      // Should not have errors
      expect(result.errors).toHaveLength(0);

      // CRITICAL: These directories must exist after adoption
      // Bug history: Template path bug caused these to not be copied
      const requiredDirs = [
        '.claude',
        '.claude/agents',
        '.claude/commands',
        '.claude/hooks',
        '.claude/rules',
        '.claude/skills',
        'scripts',
        'src/context',
      ];

      for (const dir of requiredDirs) {
        const dirPath = path.join(testDir, dir);
        expect(existsSync(dirPath), `Directory ${dir} should exist`).toBe(true);
      }
    });

    it('should copy all required script files', async () => {
      await copyTemplates({
        projectName: 'Test Project',
        projectSlug: 'test-project',
        targetDir: testDir,
      });

      // CRITICAL: These scripts are needed for VectorDB operations
      const requiredScripts = [
        'scripts/seed-context.ts',
        'scripts/retrieve-context.ts',
        'scripts/get-todo-section.ts',
        'scripts/store-journal-entry.ts',
      ];

      for (const script of requiredScripts) {
        const scriptPath = path.join(testDir, script);
        expect(existsSync(scriptPath), `Script ${script} should exist`).toBe(true);
      }
    });

    it('should copy all required context infrastructure files', async () => {
      await copyTemplates({
        projectName: 'Test Project',
        projectSlug: 'test-project',
        targetDir: testDir,
      });

      // CRITICAL: These files provide VectorDB functionality
      const requiredContextFiles = [
        'src/context/index.ts',
        'src/context/types.ts',
        'src/context/storage.ts',
        'src/context/retrieval.ts',
      ];

      for (const file of requiredContextFiles) {
        const filePath = path.join(testDir, file);
        expect(existsSync(filePath), `Context file ${file} should exist`).toBe(true);
      }
    });

    it('should copy root config files', async () => {
      await copyTemplates({
        projectName: 'Test Project',
        projectSlug: 'test-project',
        targetDir: testDir,
      });

      const requiredConfigs = [
        '.prettierrc',
        '.gitignore',
        'tsconfig.json',
      ];

      for (const config of requiredConfigs) {
        const configPath = path.join(testDir, config);
        expect(existsSync(configPath), `Config ${config} should exist`).toBe(true);
      }
    });

    it('should replace placeholders in template files', async () => {
      await copyTemplates({
        projectName: 'My Awesome Project',
        projectSlug: 'my-awesome-project',
        targetDir: testDir,
      });

      // Check that placeholders were replaced in journal.md
      const journalPath = path.join(testDir, 'journal.md');
      const journalContent = await fs.readFile(journalPath, 'utf-8');

      expect(journalContent).toContain('My Awesome Project');
      expect(journalContent).not.toContain('$PROJECT_NAME');
    });

    it('should include .lancedb in .gitignore', async () => {
      await copyTemplates({
        projectName: 'Test Project',
        projectSlug: 'test-project',
        targetDir: testDir,
      });

      const gitignorePath = path.join(testDir, '.gitignore');
      const gitignoreContent = await fs.readFile(gitignorePath, 'utf-8');

      expect(gitignoreContent).toContain('.lancedb');
    });

    it('should have project-local VectorDB path in copied types.ts', async () => {
      await copyTemplates({
        projectName: 'Test Project',
        projectSlug: 'test-project',
        targetDir: testDir,
      });

      // CRITICAL: Verify the copied types.ts has the correct DB path
      const typesPath = path.join(testDir, 'src/context/types.ts');
      const typesContent = await fs.readFile(typesPath, 'utf-8');

      expect(typesContent).toContain("dbPath: './.lancedb'");
      expect(typesContent).not.toContain('process.env.HOME');
      expect(typesContent).not.toContain('PROJECT_SLUG');
    });

    it('should report errors instead of silently failing', async () => {
      // Test with an invalid target directory (file instead of directory)
      const invalidPath = path.join(testDir, 'somefile.txt');
      await fs.writeFile(invalidPath, 'test');

      // Try to copy to a path where a file exists (should fail to create dir)
      const result = await copyTemplates({
        projectName: 'Test',
        projectSlug: 'test',
        targetDir: path.join(invalidPath, 'subdir'), // Can't create dir under a file
      });

      // Should have errors, not silently succeed
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Package.json Generation (writePackageJson)', () => {
    it('should create package.json with all required dependencies', async () => {
      await writePackageJson(testDir, 'Test Project', 'test-project');

      const packageJsonPath = path.join(testDir, 'package.json');
      const content = await fs.readFile(packageJsonPath, 'utf-8');
      const pkg = JSON.parse(content);

      // Required dependencies for VectorDB
      expect(pkg.dependencies).toHaveProperty('@lancedb/lancedb');
      expect(pkg.dependencies).toHaveProperty('openai');
      expect(pkg.dependencies).toHaveProperty('zod');
      expect(pkg.dependencies).toHaveProperty('dotenv');
    });

    it('should create package.json with all required devDependencies', async () => {
      await writePackageJson(testDir, 'Test Project', 'test-project');

      const packageJsonPath = path.join(testDir, 'package.json');
      const content = await fs.readFile(packageJsonPath, 'utf-8');
      const pkg = JSON.parse(content);

      expect(pkg.devDependencies).toHaveProperty('typescript');
      expect(pkg.devDependencies).toHaveProperty('tsx');
      expect(pkg.devDependencies).toHaveProperty('@types/node');
      expect(pkg.devDependencies).toHaveProperty('prettier');
    });

    it('should create package.json with all required scripts', async () => {
      await writePackageJson(testDir, 'Test Project', 'test-project');

      const packageJsonPath = path.join(testDir, 'package.json');
      const content = await fs.readFile(packageJsonPath, 'utf-8');
      const pkg = JSON.parse(content);

      // CRITICAL: These scripts must exist for MAO to work
      expect(pkg.scripts).toHaveProperty('seed-context');
      expect(pkg.scripts).toHaveProperty('retrieve');
      expect(pkg.scripts).toHaveProperty('lint');
      expect(pkg.scripts).toHaveProperty('format');

      // Scripts should reference the correct files
      expect(pkg.scripts['seed-context']).toContain('seed-context.ts');
      expect(pkg.scripts['retrieve']).toContain('retrieve-context.ts');
    });

    it('should set type to module for ESM support', async () => {
      await writePackageJson(testDir, 'Test Project', 'test-project');

      const packageJsonPath = path.join(testDir, 'package.json');
      const content = await fs.readFile(packageJsonPath, 'utf-8');
      const pkg = JSON.parse(content);

      expect(pkg.type).toBe('module');
    });
  });

  describe('Package.json Merging (mergePackageJson)', () => {
    it('should add missing dependencies to existing package.json', async () => {
      // Create a minimal package.json
      const existingPkg = {
        name: 'existing-project',
        version: '1.0.0',
        dependencies: {
          'some-dep': '^1.0.0',
        },
      };
      await fs.writeFile(
        path.join(testDir, 'package.json'),
        JSON.stringify(existingPkg, null, 2)
      );

      const result = await mergePackageJson(testDir);

      expect(result.error).toBeUndefined();
      expect(result.changed).toBe(true);
      expect(result.addedDependencies).toContain('@lancedb/lancedb');

      // Verify the file was updated
      const content = await fs.readFile(path.join(testDir, 'package.json'), 'utf-8');
      const pkg = JSON.parse(content);

      // Should have both old and new dependencies
      expect(pkg.dependencies).toHaveProperty('some-dep');
      expect(pkg.dependencies).toHaveProperty('@lancedb/lancedb');
    });

    it('should not overwrite existing dependencies', async () => {
      // Create package.json with an existing version of a MAO dependency
      const existingPkg = {
        name: 'existing-project',
        version: '1.0.0',
        dependencies: {
          'zod': '^2.0.0', // Older version
        },
      };
      await fs.writeFile(
        path.join(testDir, 'package.json'),
        JSON.stringify(existingPkg, null, 2)
      );

      await mergePackageJson(testDir);

      const content = await fs.readFile(path.join(testDir, 'package.json'), 'utf-8');
      const pkg = JSON.parse(content);

      // Should keep the existing version, not overwrite
      expect(pkg.dependencies.zod).toBe('^2.0.0');
    });

    it('should add lint and format scripts', async () => {
      const existingPkg = {
        name: 'existing-project',
        version: '1.0.0',
        scripts: {
          test: 'jest',
        },
      };
      await fs.writeFile(
        path.join(testDir, 'package.json'),
        JSON.stringify(existingPkg, null, 2)
      );

      const result = await mergePackageJson(testDir);

      expect(result.addedScripts).toContain('lint');
      expect(result.addedScripts).toContain('format');

      const content = await fs.readFile(path.join(testDir, 'package.json'), 'utf-8');
      const pkg = JSON.parse(content);

      expect(pkg.scripts.lint).toContain('prettier');
      expect(pkg.scripts.format).toContain('prettier');
    });
  });

  describe('Full Adoption Flow', () => {
    it('should successfully set up a complete MAO project', async () => {
      // Simulate the full adoption flow

      // Step 1: Create initial package.json (like npm init)
      const initialPkg = {
        name: 'my-app',
        version: '1.0.0',
        description: 'My application',
      };
      await fs.writeFile(
        path.join(testDir, 'package.json'),
        JSON.stringify(initialPkg, null, 2)
      );

      // Step 2: Copy templates
      const copyResult = await copyTemplates({
        projectName: 'My App',
        projectSlug: 'my-app',
        targetDir: testDir,
      });

      expect(copyResult.errors).toHaveLength(0);

      // Step 3: Merge package.json
      const mergeResult = await mergePackageJson(testDir);

      expect(mergeResult.error).toBeUndefined();

      // Step 4: Verify the project is complete
      const requiredPaths = [
        'package.json',
        '.claude/CLAUDE.md',
        '.claude/settings.json',
        'scripts/seed-context.ts',
        'src/context/types.ts',
        'src/context/storage.ts',
        '.gitignore',
        '.prettierrc',
        'journal.md',
        'todo/tasks.md',
      ];

      for (const reqPath of requiredPaths) {
        const fullPath = path.join(testDir, reqPath);
        expect(existsSync(fullPath), `${reqPath} should exist after adoption`).toBe(true);
      }

      // Step 5: Verify package.json has everything needed
      const pkgContent = await fs.readFile(path.join(testDir, 'package.json'), 'utf-8');
      const pkg = JSON.parse(pkgContent);

      expect(pkg.scripts['seed-context']).toBeDefined();
      expect(pkg.dependencies['@lancedb/lancedb']).toBeDefined();
      expect(pkg.devDependencies['tsx']).toBeDefined();
      expect(pkg.type).toBe('module');
    });
  });

  describe('Template Source Path Resolution', () => {
    it('should find templates in the correct location', async () => {
      // This test verifies the template path resolution works correctly
      // Bug history: Templates were looked for at package root instead of templates/

      const result = await copyTemplates({
        projectName: 'Test',
        projectSlug: 'test',
        targetDir: testDir,
      });

      // If template path resolution is broken, we'd get errors about missing files
      // or the copied array would be empty
      expect(result.errors).toHaveLength(0);
      expect(result.copied.length).toBeGreaterThan(0);

      // Specifically verify critical files that were affected by the bug
      expect(existsSync(path.join(testDir, 'scripts/seed-context.ts'))).toBe(true);
      expect(existsSync(path.join(testDir, 'src/context/storage.ts'))).toBe(true);
    });
  });
});
