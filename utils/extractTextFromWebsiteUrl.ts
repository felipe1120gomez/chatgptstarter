import { Document } from 'langchain/document';
import { CheerioWebBaseLoader } from 'langchain/document_loaders/web/cheerio';

export async function extractTextFromWebsiteUrl(
  url: string,
): Promise<Document[]> {
  const loader = new CheerioWebBaseLoader(url);
  const docs = await loader.load();
  return docs;
}
