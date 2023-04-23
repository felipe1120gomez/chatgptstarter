/**
 * This pinecone client is used in your api routes via the Frontend UI
 */

import { PineconeClient } from '@pinecone-database/pinecone';
import { CreatePineconeIndexArgs } from '@/types/pinecone';

//use this client in api routes
export const createPineconeIndex = async ({
  pineconeApiKey,
  pineconeEnvironment,
  pineconeIndexName,
}: CreatePineconeIndexArgs) => {
  const pinecone = new PineconeClient();

  // console.log('pineconeApiKey', pineconeApiKey);
  // console.log('pineconeEnvironment', pineconeEnvironment);
  // console.log('pineconeIndexName', pineconeIndexName);
  // console.log('pinecone', pinecone);

  await pinecone.init({
    apiKey: pineconeApiKey ?? '',
    environment: pineconeEnvironment ?? '', //this is in the pinecone dashboard
  });

  const index = pinecone.Index(pineconeIndexName);

  console.log('index', index);

  return index;
};
