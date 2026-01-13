import { describe, it, expect } from 'vitest';
import { parseMarkdownSections, parseTodoMarkdown } from './storage.js';

describe('parseMarkdownSections', () => {
  it('should parse single-level headers', () => {
    const content = `# Title

Content for title section.

## Section 1

Content for section 1.

## Section 2

Content for section 2.
`;

    const sections = parseMarkdownSections(content, 'test-doc');

    expect(sections).toHaveLength(3);
    expect(sections[0].id).toBe('test-doc-1');
    expect(sections[0].title).toBe('Title');
    expect(sections[0].content).toBe('Content for title section.');
    expect(sections[1].title).toBe('Section 1');
    expect(sections[2].title).toBe('Section 2');
  });

  it('should handle nested headers (###)', () => {
    const content = `## Main Section

Main content.

### Sub Section

Sub content.
`;

    const sections = parseMarkdownSections(content, 'nested');

    expect(sections).toHaveLength(2);
    expect(sections[0].title).toBe('Main Section');
    expect(sections[1].title).toBe('Sub Section');
  });

  it('should skip sections with empty content', () => {
    const content = `# Empty Section

## Has Content

Some content here.
`;

    const sections = parseMarkdownSections(content, 'test');

    expect(sections).toHaveLength(1);
    expect(sections[0].title).toBe('Has Content');
  });

  it('should preserve multiline content', () => {
    const content = `# Section

Line 1
Line 2
Line 3
`;

    const sections = parseMarkdownSections(content, 'test');

    expect(sections).toHaveLength(1);
    expect(sections[0].content).toBe('Line 1\nLine 2\nLine 3');
  });

  it('should handle empty document', () => {
    const sections = parseMarkdownSections('', 'empty');
    expect(sections).toHaveLength(0);
  });

  it('should handle document with no headers', () => {
    const sections = parseMarkdownSections('Just some text\nwith no headers', 'test');
    expect(sections).toHaveLength(0);
  });

  it('should assign sequential section numbers', () => {
    const content = `# One
Content
## Two
Content
### Three
Content
`;

    const sections = parseMarkdownSections(content, 'test');

    expect(sections[0].sectionNumber).toBe('1');
    expect(sections[1].sectionNumber).toBe('2');
    expect(sections[2].sectionNumber).toBe('3');
  });
});

describe('parseTodoMarkdown', () => {
  it('should parse basic todo items', () => {
    const content = `## Section 1

- [ ] Uncompleted task
- [x] Completed task
`;

    const state = parseTodoMarkdown(content);

    expect(state.sections).toHaveLength(1);
    expect(state.sections[0].name).toBe('Section 1');
    expect(state.sections[0].items).toHaveLength(2);
    expect(state.sections[0].items[0].completed).toBe(false);
    expect(state.sections[0].items[0].description).toBe('Uncompleted task');
    expect(state.sections[0].items[1].completed).toBe(true);
    expect(state.sections[0].items[1].description).toBe('Completed task');
  });

  it('should calculate completion percentage', () => {
    const content = `## Section

- [x] Done 1
- [x] Done 2
- [ ] Not done
- [ ] Not done 2
`;

    const state = parseTodoMarkdown(content);

    expect(state.sections[0].completionPct).toBe(50);
    expect(state.overallCompletionPct).toBe(50);
  });

  it('should handle uppercase X for completed items', () => {
    const content = `## Test

- [X] Uppercase X
`;

    const state = parseTodoMarkdown(content);

    expect(state.sections[0].items[0].completed).toBe(true);
  });

  it('should handle numbered sections', () => {
    const content = `### 1. First Section

- [ ] Task 1

### 2. Second Section

- [x] Task 2
`;

    const state = parseTodoMarkdown(content);

    expect(state.sections).toHaveLength(2);
    expect(state.sections[0].sectionId).toBe('1');
    expect(state.sections[0].name).toBe('First Section');
    expect(state.sections[1].sectionId).toBe('2');
    expect(state.sections[1].name).toBe('Second Section');
  });

  it('should track total and completed items', () => {
    const content = `## Section A

- [x] Done
- [ ] Not done

## Section B

- [x] Done
- [x] Done
- [ ] Not done
`;

    const state = parseTodoMarkdown(content);

    expect(state.totalItems).toBe(5);
    expect(state.completedItems).toBe(3);
    expect(state.overallCompletionPct).toBe(60);
  });

  it('should handle empty sections', () => {
    const content = `## Empty Section

## Section With Tasks

- [ ] Task
`;

    const state = parseTodoMarkdown(content);

    expect(state.sections).toHaveLength(2);
    expect(state.sections[0].items).toHaveLength(0);
    expect(state.sections[0].completionPct).toBe(0);
    expect(state.sections[1].items).toHaveLength(1);
  });

  it('should handle indented todo items', () => {
    const content = `## Section

  - [ ] Indented task
    - [x] Double indented task
`;

    const state = parseTodoMarkdown(content);

    expect(state.sections[0].items).toHaveLength(2);
  });

  it('should generate unique item IDs', () => {
    const content = `## Section

- [ ] Task 1
- [ ] Task 2
`;

    const state = parseTodoMarkdown(content);

    expect(state.sections[0].items[0].id).not.toBe(state.sections[0].items[1].id);
  });

  it('should include timestamp', () => {
    const state = parseTodoMarkdown('## Test\n- [ ] Task');

    expect(state.timestamp).toBeDefined();
    expect(new Date(state.timestamp).getTime()).not.toBeNaN();
  });

  it('should handle empty document', () => {
    const state = parseTodoMarkdown('');

    expect(state.sections).toHaveLength(0);
    expect(state.totalItems).toBe(0);
    expect(state.completedItems).toBe(0);
    expect(state.overallCompletionPct).toBe(0);
  });

  it('should handle 100% completion', () => {
    const content = `## Done Section

- [x] All
- [x] Tasks
- [x] Done
`;

    const state = parseTodoMarkdown(content);

    expect(state.sections[0].completionPct).toBe(100);
    expect(state.overallCompletionPct).toBe(100);
  });

  it('should handle decimal section numbers', () => {
    const content = `### 1.1. Subsection

- [ ] Task
`;

    const state = parseTodoMarkdown(content);

    expect(state.sections[0].sectionId).toBe('1.1');
  });
});
