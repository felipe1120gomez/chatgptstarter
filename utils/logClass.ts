//example of extending a class to log for errors
//overridethe method causing the error

import { PineconeStore as OriginalPineconeStore } from 'langchain/vectorstores/pinecone';
import { Document } from 'langchain/document';
import { OpenAIEmbeddings } from 'langchain/embeddings';
import type { VectorOperationsApi } from '@pinecone-database/pinecone/dist/pinecone-generated-ts-fetch';

type PineconeMetadata = Record<string, any>;

export interface PineconeLibArgs {
  pineconeIndex: VectorOperationsApi;
  textKey?: string;
  namespace?: string;
  filter?: PineconeMetadata;
}

export class PineconeStore extends OriginalPineconeStore {
  textKey: string;

  namespace?: string;

  pineconeIndex: VectorOperationsApi;

  filter?: PineconeMetadata;

  constructor(embeddings: OpenAIEmbeddings, args: PineconeLibArgs) {
    super(embeddings, args);

    this.embeddings = embeddings;
    this.namespace = args.namespace;
    this.pineconeIndex = args.pineconeIndex;
    this.textKey = args.textKey ?? 'text';
    this.filter = args.filter;
  }
  async addVectors(
    vectors: number[][],
    documents: Document[],
    ids?: string[],
  ): Promise<void> {
    console.log('vectors', vectors);
    console.log('documents', documents);
    console.log('ids', ids);

    // Call the original addVectors method with the provided data
    return super.addVectors(vectors, documents, ids);
  }
}
