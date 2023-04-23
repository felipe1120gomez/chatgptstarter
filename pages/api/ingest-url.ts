import type { NextApiRequest, NextApiResponse } from 'next';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { createPineconeIndex } from '@/utils/pinecone-client';
import { PINECONE_NAME_SPACE } from '@/config/pinecone';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { extractTextFromWebsiteUrl } from '@/utils/extractTextFromWebsiteUrl';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { credentials, url } = req.body;

  console.log('url', url, 'credentials', credentials);

  //only accept post requests
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  try {
    const rawDocs = await extractTextFromWebsiteUrl(url);

    //change chunk size and overlap to get different results
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      chunkOverlap: 20,
    });

    const docs = await textSplitter.splitDocuments(rawDocs);

    // /*create and store the embeddings in the vectorStore*/
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: credentials.openaiApiKey,
    });

    const index = await createPineconeIndex({
      pineconeApiKey: credentials.pineconeApiKey,
      pineconeEnvironment: credentials.pineconeEnvironment,
      pineconeIndexName: credentials.pineconeIndex,
    });

    await PineconeStore.fromDocuments(docs, embeddings, {
      pineconeIndex: index,
      namespace: PINECONE_NAME_SPACE,
      textKey: 'text',
    });

    res.status(200).json({ rawDocs });
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'Unknown error.' });
  } finally {
    res.end();
  }
}
