#!/usr/bin/env npx tsx
/**
 * Seed VectorDB with project documentation, TODO state, and journal entries.
 * Run: npm run seed-context
 */

import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import {
  initializeVectorDB,
  indexPrdSections,
  snapshotTodoState,
  parseMarkdownSections,
  parseTodoMarkdown,
  DEFAULT_CONFIG,
} from '../src/context/index.js';

const PROJECT_ROOT = process.cwd();

async function seedContext() {
  console.log('=== Seeding VectorDB Context ===\n');

  // Initialize VectorDB
  console.log('1. Initializing VectorDB...');
  await initializeVectorDB();
  console.log('   Done.\n');

  // Index documentation from docs/
  console.log('2. Indexing documentation...');
  const docsDir = path.join(PROJECT_ROOT, 'docs');
  if (fs.existsSync(docsDir)) {
    const files = fs.readdirSync(docsDir).filter((f) => f.endsWith('.md'));
    let totalSections = 0;

    for (const file of files) {
      const content = fs.readFileSync(path.join(docsDir, file), 'utf-8');
      const sections = parseMarkdownSections(content, file);
      if (sections.length > 0) {
        await indexPrdSections(sections);
        totalSections += sections.length;
        console.log(`   - ${file}: ${sections.length} sections`);
      }
    }
    console.log(`   Total: ${totalSections} sections indexed.\n`);
  } else {
    console.log('   No docs/ directory found, skipping.\n');
  }

  // Index TODO state from todo/*.md
  console.log('3. Indexing TODO state...');
  const todoDir = path.join(PROJECT_ROOT, 'todo');
  if (fs.existsSync(todoDir)) {
    const todoFiles = fs.readdirSync(todoDir).filter((f) => f.endsWith('.md'));
    let totalTodoItems = 0;

    for (const file of todoFiles) {
      const content = fs.readFileSync(path.join(todoDir, file), 'utf-8');
      const todoState = parseTodoMarkdown(content);
      if (todoState.totalItems > 0) {
        await snapshotTodoState(todoState);
        totalTodoItems += todoState.totalItems;
        console.log(
          `   - ${file}: ${todoState.sections.length} sections, ${todoState.totalItems} items (${todoState.overallCompletionPct}% complete)`
        );
      }
    }
    console.log(`   Total: ${totalTodoItems} items indexed.\n`);
  } else {
    console.log('   No todo/ directory found, skipping.\n');
  }

  // Parse and index journal entries
  console.log('4. Indexing journal entries...');
  const journalPath = path.join(PROJECT_ROOT, 'journal.md');
  if (fs.existsSync(journalPath)) {
    const content = fs.readFileSync(journalPath, 'utf-8');
    const entries = parseJournalEntries(content);
    console.log(`   ${entries.length} journal entries found`);
    // Note: Journal entries are stored individually via /journal command
    console.log('   Journal entries will be indexed when created via /journal\n');
  } else {
    console.log('   No journal.md found, skipping.\n');
  }

  console.log('=== VectorDB Seeding Complete ===');
  console.log(`Database location: ${DEFAULT_CONFIG.dbPath}`);
}

function parseJournalEntries(content: string): { timestamp: string; summary: string }[] {
  const entries: { timestamp: string; summary: string }[] = [];
  const entryRegex = /## Session:\s*(.+?)(?=\n)/g;
  const summaryRegex = /### Summary\s*\n([\s\S]*?)(?=\n###|$)/g;

  let match;
  const timestamps: string[] = [];
  while ((match = entryRegex.exec(content)) !== null) {
    timestamps.push(match[1].trim());
  }

  let summaryMatch;
  const summaries: string[] = [];
  while ((summaryMatch = summaryRegex.exec(content)) !== null) {
    summaries.push(summaryMatch[1].trim());
  }

  for (let i = 0; i < Math.min(timestamps.length, summaries.length); i++) {
    entries.push({
      timestamp: timestamps[i],
      summary: summaries[i],
    });
  }

  return entries;
}

seedContext().catch(console.error);
