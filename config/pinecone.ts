/**
 * Change the namespace to the namespace on Pinecone you'd like to store your embeddings.
 */

// if (!process.env.PINECONE_INDEX_NAME) {
//   throw new Error('Missing Pinecone index name in .env file');
// }

const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME ?? '';

// your "ingestion" will use this namespace
const PINECONE_NAME_SPACE = 'langchain-repo'; //namespace is optional for your vectors

export { PINECONE_NAME_SPACE, PINECONE_INDEX_NAME };
