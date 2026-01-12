#!/usr/bin/env npx tsx
/**
 * Get a specific TODO section by number or name.
 * Run: npx tsx scripts/get-todo-section.ts <section-id-or-name>
 */

import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import { parseTodoMarkdown } from '../src/context/index.js';

async function main() {
  const query = process.argv[2];

  if (!query) {
    console.error('Usage: npx tsx scripts/get-todo-section.ts <section-id-or-name>');
    console.error('Example: npx tsx scripts/get-todo-section.ts 1');
    console.error('Example: npx tsx scripts/get-todo-section.ts "Feature Area"');
    process.exit(1);
  }

  const todoPath = path.join(process.cwd(), 'todo', 'tasks.md');

  if (!fs.existsSync(todoPath)) {
    console.error('No todo/tasks.md found.');
    process.exit(1);
  }

  const content = fs.readFileSync(todoPath, 'utf-8');
  const todoState = parseTodoMarkdown(content);

  // Find section by ID or name
  const section = todoState.sections.find(
    (s) =>
      s.sectionId === query ||
      s.sectionId.includes(query) ||
      s.name.toLowerCase().includes(query.toLowerCase())
  );

  if (!section) {
    console.log('Section not found. Available sections:');
    for (const s of todoState.sections) {
      console.log(`  - ${s.sectionId}: ${s.name} (${s.completionPct}%)`);
    }
    process.exit(1);
  }

  console.log('=== SECTION TODO STATE ===');
  console.log(`Name: ${section.name}`);
  console.log(`ID: ${section.sectionId}`);
  console.log(`Completion: ${section.completionPct}%`);
  console.log('');
  console.log('Tasks:');
  for (const item of section.items) {
    const checkbox = item.completed ? '[x]' : '[ ]';
    console.log(`  ${checkbox} ${item.id}: ${item.description}`);
  }
}

main().catch(console.error);
