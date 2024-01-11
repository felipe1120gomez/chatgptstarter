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
  const { question, prompt, temperature, modelName, namespace, history } =
    req.body;

  console.log(req.body);

  /* {
    question: '',
    prompt: '',
    temperature: 0.7,
    modelName: '',
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
      pineconeApiKey: process.env.PINECONE_API_KEY ?? '',
      pineconeEnvironment: process.env.PINECONE_ENVIRONMENT,
      pineconeIndexName: process.env.PINECONE_INDEX_NAME ?? '',
    });

    /* create vectorstore*/
    const vectorStore = await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings({
        openAIApiKey: process.env.OPENAI_API_KEY,
      }),
      {
        pineconeIndex: index,
        textKey: 'text',
        namespace: namespace, //PINECONE_NAME_SPACE
      },
    );

    //create chain
    const chain = makeChain(vectorStore, prompt, temperature, modelName);
    //Ask a question
    const response = await chain.call({
      question: sanitizedQuestion,
      chat_history: history || [],
    });

    console.log('response', response);
    // sourceDocuments no se devuelve en la respuesta
    const responseObj = JSON.parse(response.text);
    res.status(200).json(responseObj);
  } catch (error: any) {
    console.log('error', error);
    res.status(500).json({ error: error.message || 'Something went wrong' });
  }
}
