import { Document } from 'langchain/document';
import { customPDFLoader } from './customPDFLoader';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { DocxLoader } from 'langchain/document_loaders/fs/docx';
import { JSONLoader } from 'langchain/document_loaders/fs/json';
import { CSVLoader } from 'langchain/document_loaders/fs/csv';

export default async function extractTextFromFile({
  fileData,
  filetype,
  filename,
}: {
  fileData: Buffer;
  filetype: string | null;
  filename: string;
}): Promise<Document[]> {
  console.log('extractTextFromFile', filetype, filename);

  if (!filetype) {
    throw new Error('Unkown file type');
  }

  let text: string;
  let metadata: Record<string, any> = {};
  let result: Document[] = [];
  // Handle different file types using different modules
  switch (filetype) {
    case 'application/pdf':
      // use custom pdf loader (no need for blob)
      const pdfDocs = await customPDFLoader(fileData, filename);
      result = pdfDocs;
      break;
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': // i.e. docx file
      // use blob to load pdf
      const docxBlob = new Blob([fileData], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });
      const docxLoader = new DocxLoader(docxBlob);
      const docxDoc = await docxLoader.load();
      result = docxDoc;
      break;
    // case for json
    case 'application/json':
      const jsonBlob = new Blob([fileData], { type: 'application/json' });
      const jsonLoader = new JSONLoader(jsonBlob);
      const jsonDoc = await jsonLoader.load();
      result = jsonDoc;
      break;
    case 'text/markdown':
    case 'text/csv':
      const csvBlob = new Blob([fileData], { type: 'text/csv' });
      const csvLoader = new CSVLoader(csvBlob);
      const csvDoc = await csvLoader.load();
      result = csvDoc;
      break;
    case 'text/plain':
      const textBlob = new Blob([fileData], { type: 'text/plain' });
      const textLoader = new TextLoader(textBlob);
      const textDoc = await textLoader.load();
      result = textDoc;
      break;
    default:
      throw new Error('Unsupported file type: ${filetype}');
  }

  return result;
}
