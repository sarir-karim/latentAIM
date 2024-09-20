export const generateDetailedDocumentationPrompt = `
Given the following list of files and their contents from a software repository, your job is to create a detailed documentation overview in markdown format. 
{additionalInstructions}

Here are the files in the repository with their contents:

{fileDetails}

Please generate the documentation based on this information, keeping it concise yet informative.
`;