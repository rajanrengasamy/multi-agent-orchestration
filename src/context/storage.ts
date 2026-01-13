import { connect } from '@lancedb/lancedb';
import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';
import {
  PrdSection,
  TodoState,
  TodoSection,
  TodoSectionIndexed,
  JournalEntry,
  SessionSummary,
  COLLECTIONS,
  DEFAULT_CONFIG,
  VectorDBConfig,
} from './types.js';

let openai: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openai) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openai;
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
 * Initialize VectorDB with required tables
 */
export async function initializeVectorDB(
  config: VectorDBConfig = DEFAULT_CONFIG
): Promise<void> {
  // Ensure directory exists
  const dir = path.dirname(config.dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const db = await connect(config.dbPath);

  // Create tables if they don't exist
  const existingTables = await db.tableNames();

  if (!existingTables.includes(COLLECTIONS.PRD_SECTIONS)) {
    await db.createTable(COLLECTIONS.PRD_SECTIONS, [
      {
        id: 'init',
        title: 'init',
        content: 'init',
        sectionNumber: '',
        parentSection: '',
        vector: new Array(config.embeddingDimensions).fill(0),
      },
    ]);
  }

  if (!existingTables.includes(COLLECTIONS.TODO_SNAPSHOTS)) {
    await db.createTable(COLLECTIONS.TODO_SNAPSHOTS, [
      {
        id: 'init',
        timestamp: new Date().toISOString(),
        sections: '[]',
        totalItems: 0,
        completedItems: 0,
        overallCompletionPct: 0,
      },
    ]);
  }

  if (!existingTables.includes(COLLECTIONS.TODO_SECTIONS)) {
    await db.createTable(COLLECTIONS.TODO_SECTIONS, [
      {
        id: 'init',
        sectionId: 'init',
        name: 'init',
        content: 'init',
        items: '[]',
        completionPct: 0,
        sourceFile: 'init',
        vector: new Array(config.embeddingDimensions).fill(0),
      },
    ]);
  }

  if (!existingTables.includes(COLLECTIONS.JOURNAL_ENTRIES)) {
    await db.createTable(COLLECTIONS.JOURNAL_ENTRIES, [
      {
        id: 'init',
        timestamp: new Date().toISOString(),
        summary: 'init',
        content: 'init',
        topics: '[]',
        workCompleted: '[]',
        openItems: '[]',
        vector: new Array(config.embeddingDimensions).fill(0),
      },
    ]);
  }

  if (!existingTables.includes(COLLECTIONS.SESSION_SUMMARIES)) {
    await db.createTable(COLLECTIONS.SESSION_SUMMARIES, [
      {
        id: 'init',
        timestamp: new Date().toISOString(),
        summary: 'init',
        focusAreas: '[]',
        nextSteps: '[]',
        vector: new Array(config.embeddingDimensions).fill(0),
      },
    ]);
  }

  console.log('VectorDB initialized at:', config.dbPath);
}

/**
 * Index PRD document sections
 */
export async function indexPrdSections(
  sections: PrdSection[],
  config: VectorDBConfig = DEFAULT_CONFIG
): Promise<void> {
  const db = await connect(config.dbPath);
  const table = await db.openTable(COLLECTIONS.PRD_SECTIONS);

  // Generate embeddings and prepare records
  const records = await Promise.all(
    sections.map(async (section) => {
      const embedding = await getEmbedding(
        `${section.title}\n${section.content}`,
        config
      );
      return {
        id: section.id,
        title: section.title,
        content: section.content,
        sectionNumber: section.sectionNumber || '',
        parentSection: section.parentSection || '',
        vector: embedding,
      };
    })
  );

  await table.add(records);
  console.log(`Indexed ${sections.length} PRD sections`);
}

/**
 * Store TODO state snapshot
 */
export async function snapshotTodoState(
  state: TodoState,
  config: VectorDBConfig = DEFAULT_CONFIG
): Promise<void> {
  const db = await connect(config.dbPath);
  const table = await db.openTable(COLLECTIONS.TODO_SNAPSHOTS);

  const record = {
    id: `todo-${Date.now()}`,
    timestamp: state.timestamp,
    sections: JSON.stringify(state.sections),
    totalItems: state.totalItems,
    completedItems: state.completedItems,
    overallCompletionPct: state.overallCompletionPct,
  };

  await table.add([record]);
  console.log('TODO state snapshot stored');
}

/**
 * Index TODO sections with vector embeddings for semantic search
 */
export async function indexTodoSections(
  sections: TodoSectionIndexed[],
  config: VectorDBConfig = DEFAULT_CONFIG
): Promise<void> {
  const db = await connect(config.dbPath);
  const table = await db.openTable(COLLECTIONS.TODO_SECTIONS);

  // Generate embeddings and prepare records
  const records = await Promise.all(
    sections.map(async (section) => {
      // Create rich text for embedding: section name + all item descriptions
      const embeddingText = [
        `Section ${section.sectionId}: ${section.name}`,
        ...section.items.map(
          (item) => `${item.completed ? '[DONE]' : '[TODO]'} ${item.description}`
        ),
      ].join('\n');

      const embedding = await getEmbedding(embeddingText, config);

      return {
        id: section.id,
        sectionId: section.sectionId,
        name: section.name,
        content: section.content,
        items: JSON.stringify(section.items),
        completionPct: section.completionPct,
        sourceFile: section.sourceFile,
        vector: embedding,
      };
    })
  );

  await table.add(records);
  console.log(`Indexed ${sections.length} TODO sections with embeddings`);
}

/**
 * Clear and re-index TODO sections (for updates)
 */
export async function reindexTodoSections(
  sections: TodoSectionIndexed[],
  sourceFile: string,
  config: VectorDBConfig = DEFAULT_CONFIG
): Promise<void> {
  const db = await connect(config.dbPath);
  const table = await db.openTable(COLLECTIONS.TODO_SECTIONS);

  // Delete existing sections from this source file
  await table.delete(`sourceFile = '${sourceFile}'`);

  // Index new sections
  if (sections.length > 0) {
    await indexTodoSections(sections, config);
  }
}

/**
 * Store journal entry
 */
export async function storeJournalEntry(
  entry: JournalEntry,
  config: VectorDBConfig = DEFAULT_CONFIG
): Promise<void> {
  const db = await connect(config.dbPath);
  const table = await db.openTable(COLLECTIONS.JOURNAL_ENTRIES);

  const embedding = await getEmbedding(
    `${entry.summary}\n${entry.content}`,
    config
  );

  const record = {
    id: entry.id,
    timestamp: entry.timestamp,
    summary: entry.summary,
    content: entry.content,
    topics: JSON.stringify(entry.topics),
    workCompleted: JSON.stringify(entry.workCompleted),
    openItems: JSON.stringify(entry.openItems),
    vector: embedding,
  };

  await table.add([record]);
  console.log('Journal entry stored');
}

/**
 * Store session summary
 */
export async function storeSessionSummary(
  summary: SessionSummary,
  config: VectorDBConfig = DEFAULT_CONFIG
): Promise<void> {
  const db = await connect(config.dbPath);
  const table = await db.openTable(COLLECTIONS.SESSION_SUMMARIES);

  const embedding = await getEmbedding(summary.summary, config);

  const record = {
    id: summary.id,
    timestamp: summary.timestamp,
    summary: summary.summary,
    focusAreas: JSON.stringify(summary.focusAreas),
    nextSteps: JSON.stringify(summary.nextSteps),
    vector: embedding,
  };

  await table.add([record]);
  console.log('Session summary stored');
}

/**
 * Parse markdown file into sections
 */
export function parseMarkdownSections(
  content: string,
  filename: string
): PrdSection[] {
  const sections: PrdSection[] = [];
  const lines = content.split('\n');
  let currentSection: PrdSection | null = null;
  let currentContent: string[] = [];
  let sectionIndex = 0;

  for (const line of lines) {
    const headerMatch = line.match(/^(#{1,3})\s+(.+)/);

    if (headerMatch) {
      // Save previous section
      if (currentSection) {
        currentSection.content = currentContent.join('\n').trim();
        if (currentSection.content) {
          sections.push(currentSection);
        }
      }

      // Start new section
      sectionIndex++;
      currentSection = {
        id: `${filename}-${sectionIndex}`,
        title: headerMatch[2],
        content: '',
        sectionNumber: `${sectionIndex}`,
      };
      currentContent = [];
    } else if (currentSection) {
      currentContent.push(line);
    }
  }

  // Save last section
  if (currentSection) {
    currentSection.content = currentContent.join('\n').trim();
    if (currentSection.content) {
      sections.push(currentSection);
    }
  }

  return sections;
}

/**
 * Parse TODO markdown into structured state
 */
export function parseTodoMarkdown(content: string): TodoState {
  const sections: TodoSection[] = [];
  const lines = content.split('\n');
  let currentSection: TodoSection | null = null;
  let totalItems = 0;
  let completedItems = 0;

  for (const line of lines) {
    // Match section headers (### 1. Section Name or ## Section Name)
    const sectionMatch = line.match(/^#{2,3}\s+(\d+\.?\d*\.?)?\s*(.+)/);
    if (sectionMatch) {
      if (currentSection) {
        currentSection.completionPct =
          currentSection.items.length > 0
            ? Math.round(
                (currentSection.items.filter((i) => i.completed).length /
                  currentSection.items.length) *
                  100
              )
            : 0;
        sections.push(currentSection);
      }

      currentSection = {
        sectionId: sectionMatch[1]?.replace(/\.$/, '') || `section-${sections.length + 1}`,
        name: sectionMatch[2].trim(),
        items: [],
        completionPct: 0,
      };
      continue;
    }

    // Match todo items (- [ ] or - [x])
    const todoMatch = line.match(/^\s*-\s*\[([ xX])\]\s*(.+)/);
    if (todoMatch && currentSection) {
      const completed = todoMatch[1].toLowerCase() === 'x';
      const item = {
        id: `${currentSection.sectionId}-${currentSection.items.length + 1}`,
        description: todoMatch[2].trim(),
        completed,
      };
      currentSection.items.push(item);
      totalItems++;
      if (completed) completedItems++;
    }
  }

  // Save last section
  if (currentSection) {
    currentSection.completionPct =
      currentSection.items.length > 0
        ? Math.round(
            (currentSection.items.filter((i) => i.completed).length /
              currentSection.items.length) *
              100
          )
        : 0;
    sections.push(currentSection);
  }

  return {
    timestamp: new Date().toISOString(),
    sections,
    totalItems,
    completedItems,
    overallCompletionPct:
      totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0,
  };
}

/**
 * Convert TodoState to indexable sections with full content
 */
export function todoStateToIndexedSections(
  state: TodoState,
  sourceFile: string
): TodoSectionIndexed[] {
  return state.sections.map((section) => {
    // Build full content from all items
    const content = section.items
      .map((item) => `- [${item.completed ? 'x' : ' '}] ${item.description}`)
      .join('\n');

    return {
      id: `${sourceFile}-${section.sectionId}`,
      sectionId: section.sectionId,
      name: section.name,
      content,
      items: section.items,
      completionPct: section.completionPct,
      sourceFile,
    };
  });
}
