import { Document, DocumentParams } from 'langchain/document';
import puppeteer, { Page } from 'puppeteer';

export async function extractTextFromWebsiteUrl(
  url: string,
): Promise<Document[]> {
  const visitedUrls = new Set<string>();
  const browser = await puppeteer.launch({
    headless: 'new', // modo headless
  });
  const page = await browser.newPage();
  const pageContentCache = new Map<string, string>();
  const documents = await extractTextFromWebPage(
    url,
    visitedUrls,
    page,
    pageContentCache,
  );
  await browser.close();
  return documents;
}

async function extractTextFromWebPage(
  url: string,
  visitedUrls: Set<string>,
  page: Page,
  pageContentCache: Map<string, string>,
): Promise<Document[]> {
  // Check if the URL has been visited before to avoid infinite recursion
  if (visitedUrls.has(url)) {
    return [];
  }
  visitedUrls.add(url);

  let pageContent: string = pageContentCache.get(url) || '';

  // If the page content is not in the cache, extract it and add it to the cache
  if (!pageContent) {
    await page.goto(url, { waitUntil: 'networkidle0' });
    pageContent = (await page.evaluate(() => document.body.textContent)) ?? '';
    pageContentCache.set(url, pageContent);
  }

  const documents: Document[] = [];

  // Extract text from the page and create a Document object
  const documentParams: DocumentParams = {
    pageContent,
    metadata: {
      url: url,
      title: await page.title(),
    },
  };
  documents.push(new Document(documentParams));

  console.log('open:', url);

  // Find all links on the page and recursively extract text from them
  const linkElements = await page.$$('a');
  const hostnameMatch = new URL(url).hostname.match(/[^.]+\.[^.]+$/);
  const baseUrl = hostnameMatch ? hostnameMatch[0] : '';
  const linkUrls = await Promise.all(
    linkElements.map((element) => element.getProperty('href')),
  );
  for (const linkUrl of linkUrls) {
    const stringValue = await linkUrl.jsonValue();
    if (
      stringValue &&
      !stringValue.startsWith('#') &&
      !stringValue.includes('#')
    ) {
      try {
        const absoluteLinkUrl = new URL(stringValue, url).toString();
        const linkHostnameMatch = new URL(absoluteLinkUrl).hostname.match(
          /[^.]+\.[^.]+$/,
        );
        const linkBaseUrl = linkHostnameMatch ? linkHostnameMatch[0] : '';
        if (
          (linkBaseUrl === baseUrl || !linkBaseUrl) && // permitir URLs con el mismo dominio o sin dominio
          (stringValue.startsWith('/') || stringValue.startsWith('http')) // permitir URLs relativas o completas
        ) {
          const linkedDocuments = await extractTextFromWebPage(
            absoluteLinkUrl,
            visitedUrls,
            page,
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
