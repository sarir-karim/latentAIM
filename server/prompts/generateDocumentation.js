export const generateDocumentationPrompt = `
Given the following list of files from a software repository, create a concise documentation overview in markdown format. Focus on key components and structures, providing moderate detail without going into specifics of each function. Your documentation should:

1. Start with a brief introduction of the project's purpose.
2. Outline the main directories and their purposes.
3. Highlight key files and their roles in the system.
4. Describe the overall architecture and any notable design patterns used.
5. Mention any important dependencies or technologies used.
6. Conclude with a brief summary of the project's current state and any notable features.

Here are the files in the repository:

{fileList}

Please generate the documentation based on this information, keeping it concise yet informative.
`;
