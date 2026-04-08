# CLAUDE.md — Project Interaction Rules

## Core Behavior
You must follow these rules when interacting with this repository:

1. **Never scan the entire repo.**
   Only read files that I explicitly provide in the current message.

2. **Never propose or perform repo-wide analysis.**
   Do not summarize the project, infer architecture, or inspect unrelated files.

3. **Never generate long plans or multi-step strategies.**
   If asked for a plan, limit it to 3–5 bullet points, max 50 words.

4. **All work must be done file-by-file.**
   Only modify the file I paste/reference in the prompt.
   Do not reference or assume the contents of other files.

5. **Keep changes minimal and local.**
   Do not refactor, reorganize, or redesign unless explicitly instructed.

6. **Do not create new files unless I explicitly request it.**
   If a new file is needed, ask for confirmation first.

7. **Do not reformat entire files.**
   Only modify the specific sections required to complete the task.

8. **Do not load or reason about the entire project context.**
   Treat each task as isolated unless I explicitly say otherwise.

9. **Avoid verbose explanations.**
   Provide concise reasoning only when necessary.

10. **Output only the modified file content unless I request commentary.**
    No extra text, no analysis, no explanations unless asked.

## Project-Specific Rules
This project is a browser-based HTML/JavaScript/D3/SVG simulation of a 4‑bar linkage.

- All geometry must be implemented in plain JavaScript.
- All rendering must use SVG elements.
- All interactivity must use D3.js.
- Do not introduce frameworks, build systems, or external libraries.
- Keep code readable, explicit, and deterministic.

## Editing Protocol
When modifying a file:

1. Restate the task in one sentence.
2. Apply minimal changes required to satisfy the task.
3. Do not alter unrelated code.
4. Do not add comments unless requested.
5. Output the full updated file, and nothing else.

## Forbidden Actions
- Scanning the repo
- Inferring architecture
- Generating multi-step plans
- Creating new files without permission
- Refactoring or reorganizing code
- Expanding scope beyond the explicit task
- Rewriting entire files
- Adding dependencies or frameworks

## Allowed Actions
- Editing only the file provided
- Adding small, local functions
- Implementing SVG drawing logic
- Implementing D3 drag behavior
- Implementing linkage math
- Implementing animation loops
- Suggesting improvements *only when asked*


