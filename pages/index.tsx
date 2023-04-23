import { useRef, useState, useEffect, useMemo } from 'react';
import Layout from '@/components/layout';
import styles from '@/styles/Home.module.css';
import { Message } from '@/types/chat';
import { useToast } from '@/hooks/use-toast';
import { useCredentialsCookie } from '@/context/credentials-context';
import { Chat } from '@/components/Chat';
import { Document } from 'langchain/document';
import { FileUploadArea } from '@/components/FileUploadArea';
import { urlPattern } from '@/utils/helpers';
import { WebUpload } from '@/components/WebsiteUrlUpload';
import { Credentials } from '@/components/Credentials';
import { file_upload_config } from '@/config/fileuploadconfig';
import { useRouter } from 'next/router';

export default function Home() {
  const [query, setQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [files, setFiles] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingUrl, setIsUploadingUrl] = useState(false);
  const [url, setUrl] = useState<string>('');
  const [showChat, setShowChat] = useState<boolean>(false);
  const [messageState, setMessageState] = useState<{
    messages: Message[];
    history: [string, string][];
    sourceDocs?: Document[];
  }>({
    messages: [
      {
        message: 'Hi, what would you like to learn?',
        type: 'apiMessage',
      },
    ],
    history: [],
    sourceDocs: [],
  });

  const { messages, history, sourceDocs } = messageState;

  const router = useRouter();
  const { toast } = useToast();
  const { cookieValue } = useCredentialsCookie();

  const messageListRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textAreaRef.current?.focus();
  }, []);

  function hasMissingCredentials() {
    return (
      !cookieValue ||
      !cookieValue.openaiApiKey ||
      !cookieValue.pineconeApiKey ||
      !cookieValue.pineconeEnvironment ||
      !cookieValue.pineconeIndex
    );
  }

  //handle file upload
  async function handleFileUpload() {
    if (!cookieValue || hasMissingCredentials()) {
      toast({
        title: 'Please enter your credentials',
        description:
          'You need to enter your API keys to upload files. Visit the "How it works" page',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    toast({
      title: 'Uploading files',
      description: 'Please wait while we upload your files',
      variant: 'default',
    });

    const formData = new FormData();
    formData.append('openai-api-key', cookieValue.openaiApiKey);
    formData.append('pinecone-api-key', cookieValue.pineconeApiKey);
    formData.append('pinecone-environment', cookieValue.pineconeEnvironment);
    formData.append('pinecone-index', cookieValue.pineconeIndex);
    Array.from(files || []).forEach((file) => {
      formData.append('files', file);
    });

    try {
      const response = await fetch('/api/ingest', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      console.log('data', data);

      if (data.error) {
        toast({
          title: 'Something went wrong',
          description: data.error,
          variant: 'destructive',
        });
        setIsUploading(false);
      } else {
        toast({
          title: 'Your files have been uploaded successfully',
          variant: 'default',
        });
        router.push('/chatbot');
      }
    } catch (error: any) {
      console.log(error);
      toast({
        title: 'Something went wrong, please try again',
        description: error.message || '',
        variant: 'destructive',
      });
      setIsUploading(false);
    }
    setIsUploading(false);
  }

  //handle form submission for chat
  async function handleSubmit(e: any) {
    e.preventDefault();

    if (hasMissingCredentials()) {
      toast({
        title: 'Please enter your credentials',
        description:
          'You need to enter your API keys to chat. Visit the "How it works" page',
        variant: 'destructive',
      });
      return;
    }

    if (!query) {
      alert('Please input a question');
      return;
    }

    const question = query.trim();

    setMessageState((state) => ({
      ...state,
      messages: [
        ...state.messages,
        {
          type: 'userMessage',
          message: question,
        },
      ],
    }));

    setLoading(true);
    setQuery('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          credentials: cookieValue,
          history,
        }),
      });
      const data = await response.json();
      console.log('data', data);

      if (data.error) {
        toast({
          title: 'Something went wrong',
          description: data.error,
          variant: 'destructive',
        });
      } else {
        setMessageState((state) => ({
          ...state,
          messages: [
            ...state.messages,
            {
              type: 'apiMessage',
              message: data.text,
              sourceDocs: data.sourceDocuments,
            },
          ],
          history: [...state.history, [question, data.text]],
        }));
      }
      console.log('messageState', messageState);

      setLoading(false);

      //scroll to bottom
      messageListRef.current?.scrollTo(0, messageListRef.current.scrollHeight);
    } catch (error) {
      setLoading(false);
      console.log('error', error);
    }
  }

  //handle web url submission
  async function handleUrlUpload() {
    if (hasMissingCredentials()) {
      toast({
        title: 'Please enter your credentials',
        description:
          'You need to enter your API keys to upload your url. Visit the "How it works" page',
        variant: 'destructive',
      });
      return;
    }

    if (url.length === 0) {
      toast({
        title: 'Error',
        description: 'URL is required',
        variant: 'destructive',
      });
      return;
    }

    if (!urlPattern.test(url)) {
      toast({
        title: 'Error',
        description: 'Invalid URL',
        variant: 'destructive',
      });
      return;
    }
    const urlInput = url.trim();

    setIsUploadingUrl(true);
    setUrl(urlInput);

    try {
      const response = await fetch('/api/ingest-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: urlInput,
          credentials: cookieValue,
        }),
      });
      const data = await response.json();
      if (data.error) {
        toast({
          title: 'Something went wrong',
          description: data.error,
          variant: 'destructive',
        });
        setIsUploadingUrl(false);
      } else {
        toast({
          title: 'Your website url has been uploaded successfully',
        });
        router.push('/chatbot');
      }
    } catch (error: any) {
      console.log(error);
      toast({
        title: 'Something went wrong, please try again',
        description: error.message || '',
        variant: 'destructive',
      });
      setIsUploadingUrl(false);
    }

    setUrl('');
  }

  //prevent empty submissions
  const handleEnter = (e: any) => {
    if (e.key === 'Enter' && query) {
      handleSubmit(e);
    } else if (e.key == 'Enter') {
      e.preventDefault();
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
  };

  return (
    <>
      <Layout>
        <div className="mx-auto flex flex-col gap-4">
          <h1 className="text-2xl font-bold leading-[1.1] tracking-tighter text-center">
            Chat With Your Docs
          </h1>
          <Credentials />
          <main className={styles.main}>
            <>
              <FileUploadArea
                setFiles={setFiles}
                isUploading={isUploading}
                handleFileUpload={handleFileUpload}
                files={files}
                maxFileSizeMB={file_upload_config.max_file_size_mb}
                maxNumFiles={file_upload_config.max_num_files_upload}
              />
              <h1 className="mt-5 scroll-m-20 border-b border-b-slate-100 pb-2 text-lg font-semibold tracking-tight transition-colors first:mt-0 dark:border-b-slate-300">
                OR...
              </h1>
              <WebUpload
                handleUrlUpload={handleUrlUpload}
                isUploadingUrl={isUploadingUrl}
                handleUrlChange={handleUrlChange}
                url={url}
              />
            </>
            {/* =            {showChat && (
              <Chat
                chatMessages={messages}
                handleSubmit={handleSubmit}
                handleEnter={handleEnter}
                textAreaRef={textAreaRef}
                query={query}
                setQuery={setQuery}
                loading={loading}
                sourceDocs={sourceDocs}
                messageListRef={messageListRef}
              />
            )} */}
          </main>
        </div>
        <footer className="m-auto">
          <a href="https://twitter.com/mayowaoshin">
            Powered by LangChainAI. Demo built by Mayo (Twitter: @mayowaoshin).
          </a>
        </footer>
      </Layout>
    </>
  );
}
