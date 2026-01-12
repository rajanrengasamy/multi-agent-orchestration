#!/usr/bin/env npx tsx
/**
 * Store a journal entry in VectorDB.
 * Run: npx tsx scripts/store-journal-entry.ts /path/to/entry.json
 *
 * JSON format:
 * {
 *   "summary": "Brief 1-2 sentence summary",
 *   "content": "Full description of what was accomplished",
 *   "topics": ["topic1", "topic2"],
 *   "workCompleted": ["item1", "item2"],
 *   "openItems": ["item1", "item2"]
 * }
 */

import 'dotenv/config';
import * as fs from 'fs';
import {
  storeJournalEntry,
  storeSessionSummary,
  snapshotTodoState,
  parseTodoMarkdown,
  isVectorDBAvailable,
  JournalEntry,
  SessionSummary,
} from '../src/context/index.js';
import * as path from 'path';

async function main() {
  const jsonPath = process.argv[2];

  if (!jsonPath) {
    console.error('Usage: npx tsx scripts/store-journal-entry.ts <path-to-json>');
    console.error('');
    console.error('JSON format:');
    console.error(
      JSON.stringify(
        {
          summary: 'Brief summary',
          content: 'Full description',
          topics: ['topic1'],
          workCompleted: ['item1'],
          openItems: ['item1'],
        },
        null,
        2
      )
    );
    process.exit(1);
  }

  // Check VectorDB availability
  const available = await isVectorDBAvailable();
  if (!available) {
    console.error('VectorDB not available. Run `npm run seed-context` first.');
    process.exit(1);
  }

  // Read and parse JSON
  const content = fs.readFileSync(jsonPath, 'utf-8');
  const data = JSON.parse(content);

  const timestamp = new Date().toISOString();
  const id = `journal-${Date.now()}`;

  // Store journal entry
  const entry: JournalEntry = {
    id,
    timestamp,
    summary: data.summary,
    content: data.content,
    topics: data.topics || [],
    workCompleted: data.workCompleted || [],
    openItems: data.openItems || [],
  };

  await storeJournalEntry(entry);
  console.log('Journal entry stored:', id);

  // Store session summary
  const summary: SessionSummary = {
    id: `session-${Date.now()}`,
    timestamp,
    summary: data.summary,
    focusAreas: data.topics || [],
    nextSteps: data.openItems || [],
  };

  await storeSessionSummary(summary);
  console.log('Session summary stored');

  // Snapshot current TODO state
  const todoPath = path.join(process.cwd(), 'todo', 'tasks.md');
  if (fs.existsSync(todoPath)) {
    const todoContent = fs.readFileSync(todoPath, 'utf-8');
    const todoState = parseTodoMarkdown(todoContent);
    await snapshotTodoState(todoState);
    console.log('TODO state snapshot stored');
  }

  console.log('Done!');
}

main().catch(console.error);
