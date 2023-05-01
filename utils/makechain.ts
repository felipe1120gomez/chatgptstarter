import { OpenAI } from 'langchain/llms/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { ConversationalRetrievalQAChain } from 'langchain/chains';

const CONDENSE_PROMPT = `Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.

Chat History:
{chat_history}
Follow Up Input: {question}
Standalone question:`;

// change to your own 'system' prompt
const QA_PROMPT = `You are an AI assistant. Use the following pieces of context as help to do what is asked in the question at the end.
Give the answer in Spanish. Take into account the chat_history to answer only in case the question can be related to this. If you do not find information in the context, answer that the context has not been useful.

{context}

Question: {question}
Helpful answer in markdown:`;

export const makeChain = (vectorstore: PineconeStore, openaiApiKey: string) => {
  const model = new OpenAI({
    temperature: 0.7, // increase temepreature to get more creative answers
    modelName: 'gpt-3.5-turbo',
    openAIApiKey: openaiApiKey, //change this to gpt-4 if you have access to the api
  });

  const chain = ConversationalRetrievalQAChain.fromLLM(
    model,
    vectorstore.asRetriever(),
    {
      qaTemplate: QA_PROMPT,
      questionGeneratorTemplate: CONDENSE_PROMPT,
      returnSourceDocuments: true, //The number of source documents returned is 4 by default
    },
  );

  return chain;
};
