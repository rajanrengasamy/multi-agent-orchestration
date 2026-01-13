import { z } from 'zod';

// PRD Section schema for documentation chunks
export const PrdSectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  sectionNumber: z.string().optional(),
  parentSection: z.string().optional(),
  embedding: z.array(z.number()).optional(),
});

export type PrdSection = z.infer<typeof PrdSectionSchema>;

// Todo item within a section
export const TodoItemSchema = z.object({
  id: z.string(),
  description: z.string(),
  completed: z.boolean(),
  priority: z.enum(['critical', 'high', 'medium', 'low']).optional(),
});

export type TodoItem = z.infer<typeof TodoItemSchema>;

// Todo section containing items
export const TodoSectionSchema = z.object({
  sectionId: z.string(),
  name: z.string(),
  items: z.array(TodoItemSchema),
  completionPct: z.number(),
});

export type TodoSection = z.infer<typeof TodoSectionSchema>;

// Full todo state snapshot
export const TodoStateSchema = z.object({
  timestamp: z.string(),
  sections: z.array(TodoSectionSchema),
  totalItems: z.number(),
  completedItems: z.number(),
  overallCompletionPct: z.number(),
});

export type TodoState = z.infer<typeof TodoStateSchema>;

// Journal entry for session tracking
export const JournalEntrySchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  summary: z.string(),
  content: z.string(),
  topics: z.array(z.string()),
  workCompleted: z.array(z.string()),
  openItems: z.array(z.string()),
  embedding: z.array(z.number()).optional(),
});

export type JournalEntry = z.infer<typeof JournalEntrySchema>;

// Session summary for quick context
export const SessionSummarySchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  summary: z.string(),
  focusAreas: z.array(z.string()),
  nextSteps: z.array(z.string()),
  embedding: z.array(z.number()).optional(),
});

export type SessionSummary = z.infer<typeof SessionSummarySchema>;

// Context bundle returned by retrieval
export const ContextBundleSchema = z.object({
  recentSessions: z.array(SessionSummarySchema),
  todoState: TodoStateSchema.nullable(),
  relevantPrd: z.array(PrdSectionSchema),
  journalEntries: z.array(JournalEntrySchema),
});

export type ContextBundle = z.infer<typeof ContextBundleSchema>;

// Vector-indexed TODO section for semantic search
export const TodoSectionIndexedSchema = z.object({
  id: z.string(),
  sectionId: z.string(),
  name: z.string(),
  content: z.string(), // Full text of all items for embedding
  items: z.array(TodoItemSchema),
  completionPct: z.number(),
  sourceFile: z.string(),
  embedding: z.array(z.number()).optional(),
});

export type TodoSectionIndexed = z.infer<typeof TodoSectionIndexedSchema>;

// VectorDB collection names
export const COLLECTIONS = {
  PRD_SECTIONS: 'prd_sections',
  TODO_SNAPSHOTS: 'todo_snapshots',
  TODO_SECTIONS: 'todo_sections', // NEW: Vector-indexed TODO sections
  JOURNAL_ENTRIES: 'journal_entries',
  SESSION_SUMMARIES: 'session_summaries',
} as const;

// Configuration for VectorDB
export interface VectorDBConfig {
  dbPath: string;
  embeddingModel: string;
  embeddingDimensions: number;
}

export const DEFAULT_CONFIG: VectorDBConfig = {
  dbPath: './.lancedb',
  embeddingModel: 'text-embedding-3-small',
  embeddingDimensions: 1536,
};
