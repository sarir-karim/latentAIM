// File: ./server/prompts/documentCreationPrompts.js

export const cypherGenerationPrompt = `
Given the following prompt and database schema, generate a Cypher query to fetch relevant information from the database:

Prompt: {prompt}

Database Schema:
{schema}

Your task is to create a Cypher query that retrieves information relevant to the prompt. The query should:
1. Identify and match relevant nodes and relationships based on the prompt and schema.
2. Include appropriate WHERE clauses to filter the results.
3. Return relevant properties and relationships.
4. Limit the results to a reasonable number (e.g., 10-20) to avoid overwhelming responses.

Please provide only the Cypher query without any explanation or additional text.
`;

export const cypherEvaluationPrompt = `
Evaluate and improve the following Cypher query based on the given prompt, schema, and any previous errors:

Prompt: {prompt}

Database Schema:
{schema}

Current Cypher query:
{cypher}

Previous errors (if any):
{errors}

Your task is to:
1. Identify any syntax errors or logical issues in the query.
2. Ensure the query correctly addresses the prompt and uses the schema appropriately.
3. Optimize the query for performance if possible.
4. If there are errors, fix them and provide an improved query.
5. If there are no errors and no improvements needed, return the original query.

Please respond with a JSON object in the following format:
{
  "errors": ["List of identified errors or an empty array if none"],
  "cypher": "The improved or original Cypher query"
}
`;

export const documentCreationPrompt = `
You are an AI assistant tasked with creating a detailed document based on a user's prompt and the context from a software repository database. Your goal is to produce a comprehensive response that directly addresses the user's prompt while incorporating relevant information from the provided context.

User Prompt: {prompt}

Context (retrieved from the database):
{context}

Instructions:
1. Carefully analyze the user's prompt and the provided context.
2. Create a well-structured and detailed document that directly addresses the user's prompt.
3. Incorporate relevant information from the context, ensuring accuracy and coherence.
4. Use appropriate headings, subheadings, and formatting to organize the content.
5. If the user's prompt is a question, make sure to answer it thoroughly.
6. If the user's prompt is a task or request, fulfill it to the best of your ability using the available context.
7. Include code snippets, explanations, or examples from the context when relevant to the prompt.
8. If the prompt requires comparisons or analysis across multiple files, make sure to synthesize information from different parts of the context.
9. Provide citations or references to the specific files in the context used, where appropriate.
10. The citations should be markdown links with URL format of '/files/repo_filepath'. The repo file_path should be URL encoded in the link part, but the link text should not be encoded.

Document Structure:
- Start with a brief introduction that restates the user's prompt and outlines how you'll address it.
- Organize the main body of the document with clear headings and subheadings that relate directly to aspects of the user's prompt.
- Include a conclusion that summarizes how you've addressed the user's prompt and any key takeaways.

Citation Example:
If you reference a file "server/config/neo4jConfig.js", the citation should look like:
[server/config/neo4jConfig.js](/files/server%2Fconfig%2Fneo4jConfig.js)

Remember:
- Stay focused on addressing the user's prompt throughout the document.
- Use all relevant information from the context, but don't include irrelevant details.
- If the context doesn't contain information needed to fully address the prompt, clearly state what information is missing or unavailable.
- Ensure the document is coherent, well-structured, and tailored specifically to the user's prompt.

Please generate the document content without any additional explanation or metadata. The content should be ready to be saved as the 'documentation' field of a document node.
`;

export const saveDocumentCypher = `
CREATE (d:Document {
  id: $document.id,
  title: $document.title,
  prompt: $document.prompt,
  createdAt: datetime($document.createdAt),
  updatedAt: datetime($document.updatedAt),
  documentation: $document.documentation,
  tags:$document.tags,
  version: $document.version
})
WITH d
UNWIND $contextFilePaths AS contextFilePath
MATCH (c) WHERE c.file_path = contextFilePath
CREATE (d)-[:BASED_ON]->(c)
RETURN d.id AS documentId
`;

export const updateDocumentCypher = `
MATCH (d:Document {id: $id})
CREATE (newD:Document {
  id: $newDocument.id,
  title: $newDocument.title,
  prompt: $newDocument.prompt,
  createdAt: datetime($newDocument.createdAt),
  updatedAt: datetime($newDocument.updatedAt),
  documentation: $newDocument.documentation,
  tags: $newDocument.tags,
  version: $newDocument.version
})
CREATE (d)-[:PREVIOUS_VERSION]->(newD)
WITH newD
UNWIND $contextFilePaths AS contextFilePath
MATCH (c) WHERE c.file_path = contextFilePath
CREATE (newD)-[:BASED_ON]->(c)
RETURN newD.id AS documentId
`;