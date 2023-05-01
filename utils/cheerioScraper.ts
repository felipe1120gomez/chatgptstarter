import { Document, DocumentParams } from 'langchain/document';
import { CheerioWebBaseLoader } from 'langchain/document_loaders/web/cheerio';

export async function extractTextFromWebsiteUrl(
  url: string,
): Promise<Document[]> {
  const visitedUrls = new Set<string>();
  const pageContentCache = new Map<string, string>();
  return await extractTextFromWebPage(url, visitedUrls, pageContentCache);
}

async function extractTextFromWebPage(
  url: string,
  visitedUrls: Set<string>,
  pageContentCache: Map<string, string>,
): Promise<Document[]> {
  // Check if the URL has been visited before to avoid infinite recursion
  if (visitedUrls.has(url)) {
    return [];
  }
  visitedUrls.add(url);

  const loader = new CheerioWebBaseLoader(url);
  const cheerioAPI = await loader.scrape();

  const documents: Document[] = [];

  let pageContent = pageContentCache.get(url);
  if (!pageContent) {
    // If the page content is not in the cache, extract it and add it to the cache
    pageContent = cheerioAPI.root().text();
    pageContentCache.set(url, pageContent);
  }

  // Extract text from the page and create a Document object
  const documentParams: DocumentParams = {
    pageContent,
    metadata: {
      url: url,
      title: cheerioAPI('title').text(),
    },
  };
  documents.push(new Document(documentParams));

  console.log('open:', url);

  // Find all links on the page and recursively extract text from them
  const linkUrls = cheerioAPI('a')
    .map((_, element) => element.attribs.href)
    .get();
  const hostnameMatch = new URL(url).hostname.match(/[^.]+\.[^.]+$/);
  const baseUrl = hostnameMatch ? hostnameMatch[0] : '';
  for (const linkUrl of linkUrls) {
    if (linkUrl && !linkUrl.startsWith('#') && !linkUrl.includes('#')) {
      try {
        const absoluteLinkUrl = new URL(linkUrl, url).toString();
        const linkHostnameMatch = new URL(absoluteLinkUrl).hostname.match(
          /[^.]+\.[^.]+$/,
        );
        const linkBaseUrl = linkHostnameMatch ? linkHostnameMatch[0] : '';
        if (
          (linkBaseUrl === baseUrl || !linkBaseUrl) && // permitir URLs con el mismo dominio o sin dominio
          (linkUrl.startsWith('/') || linkUrl.startsWith('http')) // permitir URLs relativas o completas
        ) {
          const linkedDocuments = await extractTextFromWebPage(
            absoluteLinkUrl,
            visitedUrls,
            pageContentCache,
          );
          documents.push(...linkedDocuments);
        }
      } catch (e) {
        console.error(`Error visiting URL: ${linkUrl}`, e);
      }
    }
  }

  return documents;
}
