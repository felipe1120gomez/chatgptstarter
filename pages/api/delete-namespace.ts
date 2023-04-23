import type { NextApiRequest, NextApiResponse } from 'next';
import { PINECONE_NAME_SPACE } from '@/config/pinecone';
import { createPineconeIndex } from '@/utils/pinecone-client';

interface DeleteRequest {
  ids?: Array<string>;
  deleteAll?: boolean;
  namespace?: string;
  filter?: object;
}

interface DeleteOperationRequest {
  deleteRequest: DeleteRequest;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  const { credentials } = req.body;

  console.log('credentials', credentials);

  try {
    const index = await createPineconeIndex({
      pineconeApiKey: credentials.pineconeApiKey,
      pineconeEnvironment: credentials.pineconeEnvironment,
      pineconeIndexName: credentials.pineconeIndex,
    });

    await index._deleteRaw({
      deleteRequest: {
        deleteAll: true,
        namespace: PINECONE_NAME_SPACE,
      },
    });
    res.status(200).json({ message: 'delete successful' });
  } catch (error: any) {
    console.log('error', error);
    res.status(500).json({ error: error.message || 'Something went wrong' });
  }
}
