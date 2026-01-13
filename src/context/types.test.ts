import { describe, it, expect } from 'vitest';
import {
  PrdSectionSchema,
  TodoItemSchema,
  TodoSectionSchema,
  TodoStateSchema,
  JournalEntrySchema,
  SessionSummarySchema,
  ContextBundleSchema,
} from './types.js';

describe('Zod Schema Validation', () => {
  describe('PrdSectionSchema', () => {
    it('should validate a valid PRD section', () => {
      const validSection = {
        id: 'prd-1',
        title: 'Introduction',
        content: 'This is the introduction section.',
      };

      const result = PrdSectionSchema.safeParse(validSection);
      expect(result.success).toBe(true);
    });

    it('should accept optional fields', () => {
      const sectionWithOptionals = {
        id: 'prd-1',
        title: 'Section',
        content: 'Content',
        sectionNumber: '1.1',
        parentSection: 'parent',
        embedding: [0.1, 0.2, 0.3],
      };

      const result = PrdSectionSchema.safeParse(sectionWithOptionals);
      expect(result.success).toBe(true);
    });

    it('should reject missing required fields', () => {
      const invalidSection = {
        id: 'prd-1',
        title: 'Title',
        // missing content
      };

      const result = PrdSectionSchema.safeParse(invalidSection);
      expect(result.success).toBe(false);
    });

    it('should reject invalid embedding type', () => {
      const invalidEmbedding = {
        id: 'prd-1',
        title: 'Title',
        content: 'Content',
        embedding: ['not', 'numbers'],
      };

      const result = PrdSectionSchema.safeParse(invalidEmbedding);
      expect(result.success).toBe(false);
    });
  });

  describe('TodoItemSchema', () => {
    it('should validate a basic todo item', () => {
      const validItem = {
        id: 'todo-1',
        description: 'Complete task',
        completed: false,
      };

      const result = TodoItemSchema.safeParse(validItem);
      expect(result.success).toBe(true);
    });

    it('should accept valid priority values', () => {
      const priorities = ['critical', 'high', 'medium', 'low'] as const;

      for (const priority of priorities) {
        const item = {
          id: 'todo-1',
          description: 'Task',
          completed: false,
          priority,
        };

        const result = TodoItemSchema.safeParse(item);
        expect(result.success).toBe(true);
      }
    });

    it('should reject invalid priority values', () => {
      const invalidItem = {
        id: 'todo-1',
        description: 'Task',
        completed: false,
        priority: 'urgent', // not a valid priority
      };

      const result = TodoItemSchema.safeParse(invalidItem);
      expect(result.success).toBe(false);
    });

    it('should require completed to be boolean', () => {
      const invalidItem = {
        id: 'todo-1',
        description: 'Task',
        completed: 'yes', // should be boolean
      };

      const result = TodoItemSchema.safeParse(invalidItem);
      expect(result.success).toBe(false);
    });
  });

  describe('TodoSectionSchema', () => {
    it('should validate a section with items', () => {
      const validSection = {
        sectionId: 'section-1',
        name: 'Sprint Tasks',
        items: [
          { id: 'item-1', description: 'Task 1', completed: true },
          { id: 'item-2', description: 'Task 2', completed: false },
        ],
        completionPct: 50,
      };

      const result = TodoSectionSchema.safeParse(validSection);
      expect(result.success).toBe(true);
    });

    it('should accept empty items array', () => {
      const emptySection = {
        sectionId: 'section-1',
        name: 'Empty Section',
        items: [],
        completionPct: 0,
      };

      const result = TodoSectionSchema.safeParse(emptySection);
      expect(result.success).toBe(true);
    });

    it('should reject invalid item in items array', () => {
      const invalidSection = {
        sectionId: 'section-1',
        name: 'Section',
        items: [{ invalid: 'item' }],
        completionPct: 0,
      };

      const result = TodoSectionSchema.safeParse(invalidSection);
      expect(result.success).toBe(false);
    });
  });

  describe('TodoStateSchema', () => {
    it('should validate a complete todo state', () => {
      const validState = {
        timestamp: '2024-01-15T10:00:00.000Z',
        sections: [
          {
            sectionId: '1',
            name: 'Section',
            items: [{ id: '1', description: 'Task', completed: true }],
            completionPct: 100,
          },
        ],
        totalItems: 1,
        completedItems: 1,
        overallCompletionPct: 100,
      };

      const result = TodoStateSchema.safeParse(validState);
      expect(result.success).toBe(true);
    });

    it('should accept empty sections', () => {
      const emptyState = {
        timestamp: '2024-01-15T10:00:00.000Z',
        sections: [],
        totalItems: 0,
        completedItems: 0,
        overallCompletionPct: 0,
      };

      const result = TodoStateSchema.safeParse(emptyState);
      expect(result.success).toBe(true);
    });
  });

  describe('JournalEntrySchema', () => {
    it('should validate a complete journal entry', () => {
      const validEntry = {
        id: 'journal-1',
        timestamp: '2024-01-15T10:00:00.000Z',
        summary: 'Worked on feature X',
        content: 'Detailed description of work done.',
        topics: ['feature-x', 'refactoring'],
        workCompleted: ['Implemented auth', 'Fixed bug'],
        openItems: ['Need to add tests'],
      };

      const result = JournalEntrySchema.safeParse(validEntry);
      expect(result.success).toBe(true);
    });

    it('should accept empty arrays', () => {
      const entryWithEmptyArrays = {
        id: 'journal-1',
        timestamp: '2024-01-15T10:00:00.000Z',
        summary: 'Summary',
        content: 'Content',
        topics: [],
        workCompleted: [],
        openItems: [],
      };

      const result = JournalEntrySchema.safeParse(entryWithEmptyArrays);
      expect(result.success).toBe(true);
    });

    it('should accept optional embedding', () => {
      const entryWithEmbedding = {
        id: 'journal-1',
        timestamp: '2024-01-15T10:00:00.000Z',
        summary: 'Summary',
        content: 'Content',
        topics: [],
        workCompleted: [],
        openItems: [],
        embedding: [0.1, 0.2, 0.3],
      };

      const result = JournalEntrySchema.safeParse(entryWithEmbedding);
      expect(result.success).toBe(true);
    });
  });

  describe('SessionSummarySchema', () => {
    it('should validate a valid session summary', () => {
      const validSummary = {
        id: 'session-1',
        timestamp: '2024-01-15T10:00:00.000Z',
        summary: 'Productive session on auth module',
        focusAreas: ['authentication', 'security'],
        nextSteps: ['Add unit tests', 'Review PR'],
      };

      const result = SessionSummarySchema.safeParse(validSummary);
      expect(result.success).toBe(true);
    });

    it('should accept empty focus areas and next steps', () => {
      const minimalSummary = {
        id: 'session-1',
        timestamp: '2024-01-15T10:00:00.000Z',
        summary: 'Quick session',
        focusAreas: [],
        nextSteps: [],
      };

      const result = SessionSummarySchema.safeParse(minimalSummary);
      expect(result.success).toBe(true);
    });
  });

  describe('ContextBundleSchema', () => {
    it('should validate a complete context bundle', () => {
      const validBundle = {
        recentSessions: [
          {
            id: 'session-1',
            timestamp: '2024-01-15T10:00:00.000Z',
            summary: 'Session 1',
            focusAreas: [],
            nextSteps: [],
          },
        ],
        todoState: {
          timestamp: '2024-01-15T10:00:00.000Z',
          sections: [],
          totalItems: 0,
          completedItems: 0,
          overallCompletionPct: 0,
        },
        relevantPrd: [
          {
            id: 'prd-1',
            title: 'Section',
            content: 'Content',
          },
        ],
        journalEntries: [],
      };

      const result = ContextBundleSchema.safeParse(validBundle);
      expect(result.success).toBe(true);
    });

    it('should accept null todoState', () => {
      const bundleWithNullTodo = {
        recentSessions: [],
        todoState: null,
        relevantPrd: [],
        journalEntries: [],
      };

      const result = ContextBundleSchema.safeParse(bundleWithNullTodo);
      expect(result.success).toBe(true);
    });

    it('should accept empty arrays for all fields', () => {
      const emptyBundle = {
        recentSessions: [],
        todoState: null,
        relevantPrd: [],
        journalEntries: [],
      };

      const result = ContextBundleSchema.safeParse(emptyBundle);
      expect(result.success).toBe(true);
    });
  });
});
