import React, { useState } from 'react';
import Link from 'next/link';
import Layout from '@/components/layout';
import { Credentials } from '@/components/Credentials';

export default function About() {
  return (
    <Layout>
      <section className="max-w-lg mx-auto py-6">
        <div className="flex flex-col items-start gap-2 ">
          <h2 className="mt-10 scroll-m-20 pb-2 text-2xl font-semibold tracking-tight transition-colors first:mt-0">
            How it works
          </h2>
          <div>
            <h3 className="mt-10 scroll-m-20 pb-2 text-xl font-semibold tracking-tight transition-colors first:mt-0">
              Credentials
            </h3>
            <p className="my-2">
              This starterkit app is powered by OpenAI and Pinecone to generate
              completions and embeddings, so you can {'chat'} with your
              document(s).
              <br></br>
              <br></br>
              Both require your API keys to work. Your API keys will not be
              saved on the server, they will be stored in browser cookies for 7
              days.
            </p>
            <Credentials />
          </div>

          <div className="mt-3">
            <h3 className="mt-10 scroll-m-20 pb-2 text-xl font-semibold tracking-tight transition-colors first:mt-0">
              Instructions to add credentials
            </h3>
            <ol className="p-4">
              <li>
                1. Get your Open AI Keys from{' '}
                <Link
                  className="cursor-pointer text-blue-500 hover:text-blue-700 hover:underline"
                  href="https://platform.openai.com/account/api-keys"
                  target="_blank"
                  rel="noreferrer"
                >
                  Open AI
                </Link>
              </li>
              <li>
                2. Create a Pinecone account, then get your API key, Pinecone
                environment and index name.{' '}
                <Link
                  className="cursor-pointer text-blue-500 hover:text-blue-700 hover:underline"
                  href="https://app.pinecone.io/"
                  target="_blank"
                  rel="noreferrer"
                >
                  Pinecone Sign Up.
                </Link>
              </li>
            </ol>
          </div>
          <div>
            <h3 className="mt-10 scroll-m-20 pb-2 text-xl font-semibold tracking-tight transition-colors first:mt-0">
              Navigation
            </h3>
            <div className="my-2">
              <ul>
                <li>
                  <b>Upload</b>: The upload page allows you to upload one or
                  more files include .txt, .md, .docx, .csv, and .pdf.
                </li>{' '}
                <li>
                  <b>Chatbot</b>: The chatbot page allows you to chat with your
                  document. Please make sure you have uploaded a document first.{' '}
                </li>
              </ul>
            </div>
          </div>
          <div>
            <h3 className="mt-10 scroll-m-20 pb-2 text-xl font-semibold tracking-tight transition-colors first:mt-0">
              Limitations
            </h3>
            <p className="my-2">
              Due to Vercel serverless functions limitations, the app is limited
              to only 3 file uploads at a time and a total of 4MB file size
              upload.
              <br></br>
              <br></br>
              In addition, the app inserts embeddings into only one pinecone
              namespace by default called {`pdf-starter`}. If you want to add
              new files after uploading, you will first need to delete the old
              one or modify the hardcoded namespace.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
