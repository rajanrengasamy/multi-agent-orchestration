import { connect, Table } from '@lancedb/lancedb';
import OpenAI from 'openai';
import {
  PrdSection,
  TodoState,
  JournalEntry,
  SessionSummary,
  COLLECTIONS,
  DEFAULT_CONFIG,
  VectorDBConfig,
} from './types.js';

let openai: OpenAI | null = null;
let dbConnection: Awaited<ReturnType<typeof connect>> | null = null;

function getOpenAI(): OpenAI {
  if (!openai) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openai;
}

async function getDB(config: VectorDBConfig = DEFAULT_CONFIG) {
  if (!dbConnection) {
    dbConnection = await connect(config.dbPath);
  }
  return dbConnection;
}

async function getEmbedding(
  text: string,
  config: VectorDBConfig = DEFAULT_CONFIG
): Promise<number[]> {
  const client = getOpenAI();
  const response = await client.embeddings.create({
    model: config.embeddingModel,
    input: text,
  });
  return response.data[0].embedding;
}

/**
 * Query PRD sections by semantic similarity
 */
export async function queryPrdSections(
  query: string,
  limit: number = 5,
  config: VectorDBConfig = DEFAULT_CONFIG
): Promise<PrdSection[]> {
  try {
    const db = await getDB(config);
    const table = await db.openTable(COLLECTIONS.PRD_SECTIONS);
    const queryEmbedding = await getEmbedding(query, config);

    const results = await table
      .vectorSearch(queryEmbedding)
      .limit(limit)
      .toArray();

    return results.map((row) => ({
      id: row.id as string,
      title: row.title as string,
      content: row.content as string,
      sectionNumber: row.sectionNumber as string | undefined,
      parentSection: row.parentSection as string | undefined,
    }));
  } catch (error) {
    console.error('Error querying PRD sections:', error);
    return [];
  }
}

/**
 * Get the most recent TODO state snapshot
 */
export async function getCurrentTodoState(
  config: VectorDBConfig = DEFAULT_CONFIG
): Promise<TodoState | null> {
  try {
    const db = await getDB(config);
    const table = await db.openTable(COLLECTIONS.TODO_SNAPSHOTS);

    // Get most recent by timestamp - use query() for non-vector operations
    const results = await table
      .query()
      .limit(1)
      .toArray();

    if (results.length === 0) return null;

    const row = results[0];
    return {
      timestamp: row.timestamp as string,
      sections: JSON.parse(row.sections as string),
      totalItems: row.totalItems as number,
      completedItems: row.completedItems as number,
      overallCompletionPct: row.overallCompletionPct as number,
    };
  } catch (error) {
    console.error('Error getting TODO state:', error);
    return null;
  }
}

/**
 * Query journal entries by semantic similarity
 */
export async function queryJournalEntries(
  query: string,
  limit: number = 3,
  config: VectorDBConfig = DEFAULT_CONFIG
): Promise<JournalEntry[]> {
  try {
    const db = await getDB(config);
    const table = await db.openTable(COLLECTIONS.JOURNAL_ENTRIES);
    const queryEmbedding = await getEmbedding(query, config);

    const results = await table
      .vectorSearch(queryEmbedding)
      .limit(limit)
      .toArray();

    return results.map((row) => ({
      id: row.id as string,
      timestamp: row.timestamp as string,
      summary: row.summary as string,
      content: row.content as string,
      topics: JSON.parse(row.topics as string),
      workCompleted: JSON.parse(row.workCompleted as string),
      openItems: JSON.parse(row.openItems as string),
    }));
  } catch (error) {
    console.error('Error querying journal entries:', error);
    return [];
  }
}

/**
 * Get recent session summaries
 */
export async function getRecentSessions(
  limit: number = 3,
  config: VectorDBConfig = DEFAULT_CONFIG
): Promise<SessionSummary[]> {
  try {
    const db = await getDB(config);
    const table = await db.openTable(COLLECTIONS.SESSION_SUMMARIES);

    // Use query() for non-vector operations
    const results = await table
      .query()
      .limit(limit)
      .toArray();

    return results.map((row) => ({
      id: row.id as string,
      timestamp: row.timestamp as string,
      summary: row.summary as string,
      focusAreas: JSON.parse(row.focusAreas as string),
      nextSteps: JSON.parse(row.nextSteps as string),
    }));
  } catch (error) {
    console.error('Error getting recent sessions:', error);
    return [];
  }
}

/**
 * Get full context bundle for session start
 */
export async function getContextBundle(
  query: string = 'project context',
  config: VectorDBConfig = DEFAULT_CONFIG
): Promise<{
  recentSessions: SessionSummary[];
  todoState: TodoState | null;
  relevantPrd: PrdSection[];
  journalEntries: JournalEntry[];
}> {
  const [recentSessions, todoState, relevantPrd, journalEntries] =
    await Promise.all([
      getRecentSessions(3, config),
      getCurrentTodoState(config),
      queryPrdSections(query, 5, config),
      queryJournalEntries(query, 3, config),
    ]);

  return {
    recentSessions,
    todoState,
    relevantPrd,
    journalEntries,
  };
}

/**
 * Check if VectorDB is available
 */
export async function isVectorDBAvailable(
  config: VectorDBConfig = DEFAULT_CONFIG
): Promise<boolean> {
  try {
    await getDB(config);
    return true;
  } catch {
    return false;
  }
}
