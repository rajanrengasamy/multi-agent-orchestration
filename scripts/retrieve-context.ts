#!/usr/bin/env npx tsx
/**
 * Retrieve context from VectorDB for agents.
 * Run: npx tsx scripts/retrieve-context.ts "your query here"
 */

import 'dotenv/config';
import {
  getContextBundle,
  isVectorDBAvailable,
  queryPrdSections,
  queryTodoSections,
  getCurrentTodoState,
  queryJournalEntries,
  getRecentSessions,
} from '../src/context/index.js';

async function main() {
  const query = process.argv[2] || 'project context';

  // Check VectorDB availability
  const available = await isVectorDBAvailable();
  if (!available) {
    console.log('VectorDB: NOT FOUND');
    console.log('Run `npm run seed-context` to initialize.');
    process.exit(1);
  }

  console.log('VectorDB: AVAILABLE\n');
  console.log(`Query: "${query}"\n`);
  console.log('='.repeat(60));

  // Get full context bundle
  const bundle = await getContextBundle(query);

  // Recent Sessions
  console.log('\n=== RECENT SESSIONS ===\n');
  if (bundle.recentSessions.length === 0) {
    console.log('No session summaries found.');
  } else {
    for (const session of bundle.recentSessions) {
      console.log(`[${session.timestamp}]`);
      console.log(session.summary);
      if (session.focusAreas.length > 0) {
        console.log(`Focus: ${session.focusAreas.join(', ')}`);
      }
      if (session.nextSteps.length > 0) {
        console.log(`Next: ${session.nextSteps.join(', ')}`);
      }
      console.log('');
    }
  }

  // Relevant TODO Sections (semantic search)
  console.log('=== RELEVANT TODO SECTIONS (Semantic Match) ===\n');
  if (bundle.relevantTodoSections.length === 0) {
    console.log('No relevant TODO sections found.');
  } else {
    for (const section of bundle.relevantTodoSections) {
      const icon = section.completionPct === 100 ? '✓' : '○';
      console.log(`${icon} Section ${section.sectionId}: ${section.name} (${section.completionPct}%)`);
      console.log(`   Source: ${section.sourceFile}`);
      for (const item of section.items) {
        const checkbox = item.completed ? '[x]' : '[ ]';
        console.log(`    ${checkbox} ${item.description}`);
      }
      console.log('');
    }
  }

  // Full TODO State (snapshot)
  console.log('=== FULL TODO STATE (Snapshot) ===\n');
  if (!bundle.todoState) {
    console.log('No TODO state found.');
  } else {
    console.log(
      `Overall: ${bundle.todoState.overallCompletionPct}% complete (${bundle.todoState.completedItems}/${bundle.todoState.totalItems})\n`
    );
    for (const section of bundle.todoState.sections) {
      const icon = section.completionPct === 100 ? '✓' : '○';
      console.log(`${icon} ${section.sectionId}. ${section.name} (${section.completionPct}%)`);
      for (const item of section.items) {
        const checkbox = item.completed ? '[x]' : '[ ]';
        console.log(`    ${checkbox} ${item.description}`);
      }
    }
  }

  // Relevant PRD Sections
  console.log('\n=== RELEVANT PRD SECTIONS ===\n');
  if (bundle.relevantPrd.length === 0) {
    console.log('No relevant PRD sections found.');
  } else {
    for (const section of bundle.relevantPrd) {
      console.log(`### ${section.title}`);
      // Truncate content for display
      const preview =
        section.content.length > 500
          ? section.content.substring(0, 500) + '...'
          : section.content;
      console.log(preview);
      console.log('');
    }
  }

  // Journal Entries
  console.log('=== RELEVANT JOURNAL ENTRIES ===\n');
  if (bundle.journalEntries.length === 0) {
    console.log('No relevant journal entries found.');
  } else {
    for (const entry of bundle.journalEntries) {
      console.log(`[${entry.timestamp}] ${entry.summary}`);
      if (entry.topics.length > 0) {
        console.log(`Topics: ${entry.topics.join(', ')}`);
      }
      console.log('');
    }
  }

  console.log('='.repeat(60));
}

main().catch(console.error);
