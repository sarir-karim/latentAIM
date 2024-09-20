import driver from "../config/neo4jConfig.js";
import logger from "../../shared/logger.js";
import {
    documentCreationPrompt,
    saveDocumentCypher,
    updateDocumentCypher,
} from "../prompts/documentCreationPrompts.js";
import { callClaude } from "./ClaudeApiClient.js";

async function generateCypher(tags) {
    if (!tags || tags.length === 0) {
        return { query: "MATCH (n:RepoFile) RETURN n LIMIT 100", params: {} };
    }

    const tagNames = tags.map((_, index) => `$tagName${index}`).join(", ");

    const query = `
    MATCH (tag)
    WHERE (tag:TopicTag OR tag:Tag) AND tag.name IN [${tagNames}]
    MATCH (n)-[:ASSOCIATED_WITH]-(tag)
    RETURN DISTINCT n
    LIMIT 100
    `;

    const params = tags.reduce((acc, tag, index) => {
        acc[`tagName${index}`] = tag.name;
        return acc;
    }, {});

    return { query, params };
}

async function getResults(cypher) {
    const session = driver.session();
    const { query, params } = cypher;
    try {
        const result = await session.run(query, params);
        return result.records.map((record) => record.get("n").properties);
    } catch (error) {
        logger.error(`Error executing Cypher query: ${error.message}`);
        throw error;
    } finally {
        await session.close();
    }
}

async function createDocument(prompt, context) {
    try {
        const serializedPrompt = documentCreationPrompt
            .replace("{prompt}", prompt)
            .replace("{context}", JSON.stringify(context));
        const response = await callClaude(serializedPrompt);
        return response;
    } catch (error) {
        logger.error(`Error creating document: ${error.message}`);
        throw error;
    }
}

async function saveDocument(document, contextFilePaths) {
    const session = driver.session();
    try {
        const result = await session.run(saveDocumentCypher, {
            document,
            contextFilePaths,
        });
        return result.records[0].get("documentId");
    } finally {
        await session.close();
    }
}

async function updateDocument(id, newDocument, contextFilePaths) {
    const session = driver.session();
    try {
        const result = await session.run(updateDocumentCypher, {
            id,
            newDocument,
            contextFilePaths,
        });
        return result.records[0].get("documentId");
    } finally {
        await session.close();
    }
}

async function getLatestDocumentVersion(id) {
    const session = driver.session();
    try {
        const result = await session.run(
            `MATCH (d:Document {id: $id})
             RETURN d.version AS version`,
            { id },
        );
        return result.records[0]?.get("version") || 0;
    } finally {
        await session.close();
    }
}
export async function createArtifactCreationChain() {
    return async (input) => {
        console.log(`\n>>>>>> QUERY\n`, input, `\n>>>>>\n`);
        let promptTags = [];

        // Step 1: Parse and validate tags
        try {
            if (input.tags) {
                if (typeof input.tags === 'string') {
                    promptTags = JSON.parse(input.tags);
                } else if (Array.isArray(input.tags)) {
                    promptTags = input.tags;
                }
            }
        } catch (error) {
            console.error("Error parsing tags:", error);
            // If parsing fails, continue with empty tags
        }

        // Ensure promptTags is always an array
        promptTags = Array.isArray(promptTags) ? promptTags : [];

        // Step 2: Generate Cypher to fetch relevant files and documents
        const cypher = await generateCypher(promptTags);
        console.log(`\n>>>>>> GENERATED CYPHER\n`, cypher, `\n>>>>>\n`);

        // Step 3: Use the Cypher to get context from the graph
        const context = await getResults(cypher);

        // Step 4: Create the document using the context and schema
        const documentation = await createDocument(input.prompt, context);

        // Step 5: Prepare the document node
        const now = new Date().toISOString();
        let version = 1;
        let isUpdate = false;

        if (input.id) {
            isUpdate = true;
            version = (await getLatestDocumentVersion(input.id)) + 1;
        }

        const documentNode = {
            id: input.id || crypto.randomUUID(),
            title: input.title || `Generated Document ${now}`,
            prompt: input.prompt,
            createdAt: now,
            updatedAt: now,
            documentation: documentation,
            version: version,
            tags: JSON.stringify(promptTags),  // Use the parsed and validated tags
        };

        // Step 6: Save the document and link it with context nodes
        const contextFilePaths = context.map((node) => node.file_path);
        let documentId;

        if (isUpdate) {
            documentId = await updateDocument(
                input.id,
                documentNode,
                contextFilePaths,
            );
            console.log(
                `\n>>>>>> UPDATED DOCUMENT\n`,
                documentNode,
                `\n>>>>>\n`,
            );
        } else {
            documentId = await saveDocument(documentNode, contextFilePaths);
            console.log(
                `\n>>>>>> SAVED NEW DOCUMENT\n`,
                documentNode,
                `\n>>>>>\n`,
            );
        }

        return {
            documentId,
            document: documentNode,
            isUpdate,
        };
    };
}

export default createArtifactCreationChain;
