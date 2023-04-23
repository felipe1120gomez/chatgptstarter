import { Document } from 'langchain/document';

export async function customPDFLoader(
  raw: Buffer,
  filename: string = '',
): Promise<Document[]> {
  const { default: pdf } = await import('pdf-parse/lib/pdf-parse.js');
  const parsed = await pdf(raw);
  return [
    new Document({
      pageContent: parsed.text,
      metadata: {
        source: filename,
        pdf_numpages: parsed.numpages,
      },
    }),
  ];
}
