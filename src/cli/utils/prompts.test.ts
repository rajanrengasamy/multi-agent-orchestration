import { describe, it, expect } from 'vitest';
import {
  slugify,
  isValidProjectName,
  getProjectNameError,
  capitalize,
  slugToDisplayName,
} from './prompts.js';

describe('prompts utilities', () => {
  describe('slugify', () => {
    it('should convert spaces to hyphens', () => {
      expect(slugify('my project')).toBe('my-project');
      expect(slugify('my  multiple  spaces')).toBe('my-multiple-spaces');
    });

    it('should convert to lowercase', () => {
      expect(slugify('MyProject')).toBe('myproject');
      expect(slugify('MY PROJECT')).toBe('my-project');
    });

    it('should remove special characters', () => {
      expect(slugify('my@project!')).toBe('myproject');
      expect(slugify('project#123')).toBe('project123');
    });

    it('should trim leading and trailing hyphens', () => {
      expect(slugify('-my-project-')).toBe('my-project');
      expect(slugify('  my project  ')).toBe('my-project');
    });

    it('should collapse multiple hyphens into one', () => {
      expect(slugify('my---project')).toBe('my-project');
      expect(slugify('my - - project')).toBe('my-project');
    });

    it('should handle empty strings', () => {
      expect(slugify('')).toBe('');
      expect(slugify('   ')).toBe('');
    });

    it('should handle numbers', () => {
      expect(slugify('project 123')).toBe('project-123');
      expect(slugify('123project')).toBe('123project');
    });
  });

  describe('isValidProjectName', () => {
    it('should accept valid project names', () => {
      expect(isValidProjectName('my-project')).toBe(true);
      expect(isValidProjectName('myProject')).toBe(true);
      expect(isValidProjectName('my_project')).toBe(true);
      expect(isValidProjectName('project123')).toBe(true);
      expect(isValidProjectName('a')).toBe(true);
    });

    it('should reject empty names', () => {
      expect(isValidProjectName('')).toBe(false);
    });

    it('should reject names starting with hyphen or underscore', () => {
      expect(isValidProjectName('-project')).toBe(false);
      expect(isValidProjectName('_project')).toBe(false);
    });

    it('should reject names with special characters', () => {
      expect(isValidProjectName('my project')).toBe(false);
      expect(isValidProjectName('my@project')).toBe(false);
      expect(isValidProjectName('my/project')).toBe(false);
      expect(isValidProjectName('my.project')).toBe(false);
    });

    it('should reject names exceeding 214 characters', () => {
      const longName = 'a'.repeat(215);
      expect(isValidProjectName(longName)).toBe(false);

      const maxName = 'a'.repeat(214);
      expect(isValidProjectName(maxName)).toBe(true);
    });
  });

  describe('getProjectNameError', () => {
    it('should return error for empty name', () => {
      expect(getProjectNameError('')).toBe('Project name cannot be empty');
    });

    it('should return error for name starting with hyphen or underscore', () => {
      expect(getProjectNameError('-project')).toBe(
        'Project name cannot start with a hyphen or underscore'
      );
      expect(getProjectNameError('_project')).toBe(
        'Project name cannot start with a hyphen or underscore'
      );
    });

    it('should return error for invalid characters', () => {
      expect(getProjectNameError('my project')).toBe(
        'Project name can only contain letters, numbers, hyphens, and underscores'
      );
      expect(getProjectNameError('my@project')).toBe(
        'Project name can only contain letters, numbers, hyphens, and underscores'
      );
    });

    it('should return error for names exceeding 214 characters', () => {
      const longName = 'a'.repeat(215);
      expect(getProjectNameError(longName)).toBe(
        'Project name cannot exceed 214 characters'
      );
    });
  });

  describe('capitalize', () => {
    it('should capitalize first letter', () => {
      expect(capitalize('hello')).toBe('Hello');
      expect(capitalize('world')).toBe('World');
    });

    it('should handle already capitalized strings', () => {
      expect(capitalize('Hello')).toBe('Hello');
    });

    it('should handle single characters', () => {
      expect(capitalize('a')).toBe('A');
    });

    it('should handle empty strings', () => {
      expect(capitalize('')).toBe('');
    });

    it('should preserve rest of string case', () => {
      expect(capitalize('hELLO')).toBe('HELLO');
    });
  });

  describe('slugToDisplayName', () => {
    it('should convert hyphenated slugs to title case', () => {
      expect(slugToDisplayName('my-project')).toBe('My Project');
      expect(slugToDisplayName('hello-world')).toBe('Hello World');
    });

    it('should convert underscored slugs to title case', () => {
      expect(slugToDisplayName('my_project')).toBe('My Project');
    });

    it('should handle mixed separators', () => {
      expect(slugToDisplayName('my-awesome_project')).toBe('My Awesome Project');
    });

    it('should handle single word slugs', () => {
      expect(slugToDisplayName('project')).toBe('Project');
    });

    it('should handle empty strings', () => {
      expect(slugToDisplayName('')).toBe('');
    });

    it('should handle multiple consecutive separators', () => {
      expect(slugToDisplayName('my--project')).toBe('My Project');
      expect(slugToDisplayName('my__project')).toBe('My Project');
    });
  });
});
