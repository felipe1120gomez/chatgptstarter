import { OpenAI } from 'langchain/llms/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { ConversationalRetrievalQAChain } from 'langchain/chains';

const CONDENSE_PROMPT = `Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.

Chat History:
{chat_history}
Follow Up Input: {question}
Standalone question:`;

// change to your own 'system' prompt
const QA_PROMPT = `Your job is to develop as many multiple choice questions as you can about the topic that appear in the question at the end. 
Always reply in a JSON that contains an array with objects like this question: '', options: [answer: '', correct: boolean]. 
There should be four options, one of them the correct one.
The multiple choice questions and options must be in Spanish. 
Use the information in the following context to do your job. 
If you do not find information in the context, reply with an empty JSON. 

{context}

Question: {question}
Reply:`;

export const makeChain = (
  vectorstore: PineconeStore,
  prompt: string,
  temperature: number,
  modelName: string,
) => {
  const model = new OpenAI({
    temperature: temperature, // increase temepreature to get more creative answers
    modelName: modelName, //change this to gpt-4 if you have access to the api
    openAIApiKey: process.env.OPENAI_API_KEY,
  });

  const chain = ConversationalRetrievalQAChain.fromLLM(
    model,
    vectorstore.asRetriever(),
    {
      qaTemplate: prompt,
      questionGeneratorTemplate: CONDENSE_PROMPT,
      returnSourceDocuments: true, //The number of source documents returned is 4 by default
    },
  );

  return chain;
};
