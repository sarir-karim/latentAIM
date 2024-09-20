// File: ./server/prompts/generateMermaidDiagram.js

export default `
Given the details below, generate a Mermaid diagram that represents the internal structure and processes. Capture all relevant elements such as functions, classes, conditionals, and loops.

<TASK_INSTRUCTIONS>
Generate the diagram using the correct Mermaid syntax, starting directly with the diagram type (e.g., flowchart TD, classDiagram). The output should include only the Mermaid code.

IMPORTANT: Do not include any prefixes, markdown formatting, or code block syntax. Return only the Mermaid code starting with the diagram type declaration.

Correct Output Example:
flowchart TD
    A[Start] --> B{Condition}
    B -->|Yes| C[Process 1]
    B -->|No| D[Process 2]
    C --> E[End]
    D --> E

Incorrect Output Example:
'''mermaid
flowchart TD
    A[Start] --> B{Condition}
    B -->|Yes| C[Process 1]
    B -->|No| D[Process 2]
    C --> E[End]
    D --> E

Ensure the output matches the correct example format.
</TASK_INSTRUCTIONS>

<FILE_DETAILS>
File Type: {fileType}
File Content:
{fileContent}
</FILE_DETAILS>
`;
