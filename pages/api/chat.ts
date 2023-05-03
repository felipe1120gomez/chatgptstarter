import type { NextApiRequest, NextApiResponse } from 'next';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { makeChain } from '@/utils/makechain';
import { PINECONE_NAME_SPACE } from '@/config/pinecone';
import { createPineconeIndex } from '@/utils/pinecone-client';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { question, history, credentials } = req.body; // agregar prompt, y namespace - quitar credentials

  console.log(req.body);

  /* {
    question: '<Suspense>',
    prompt: '',
    namespace: '',
    history: []
  } */

  //only accept post requests
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // OpenAI recommends replacing newlines with spaces for best results
  const sanitizedQuestion = question.trim().replaceAll('\n', ' ');

  try {
    const index = await createPineconeIndex({
      pineconeApiKey: credentials.pineconeApiKey,
      pineconeEnvironment: credentials.pineconeEnvironment,
      pineconeIndexName: credentials.pineconeIndex, //process.env.PINECONE_INDEX_NAME ?? ''
    });

    /* create vectorstore*/
    const vectorStore = await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings({
        openAIApiKey: credentials.openaiApiKey,
      }),
      {
        pineconeIndex: index,
        textKey: 'text',
        namespace: PINECONE_NAME_SPACE,
      },
    );

    //create chain
    const chain = makeChain(vectorStore, credentials.openaiApiKey); // pasar el prompt
    //Ask a question
    const response = await chain.call({
      question: sanitizedQuestion,
      chat_history: history || [],
    });

    console.log('response', response);
    res.status(200).json(response);
  } catch (error: any) {
    console.log('error', error);
    res.status(500).json({ error: error.message || 'Something went wrong' });
  }
}
