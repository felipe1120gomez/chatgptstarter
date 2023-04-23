import { useRef, useState, useEffect, useMemo } from 'react';
import Layout from '@/components/layout';
import styles from '@/styles/Home.module.css';
import { Message } from '@/types/chat';
import { useToast } from '@/hooks/use-toast';
import { useCredentialsCookie } from '@/context/credentials-context';
import { Chat } from '@/components/Chat';
import { Document } from 'langchain/document';

export default function ChatBot() {
  const [query, setQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
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

  //handle form submission
  async function handleSubmit(e: any) {
    e.preventDefault();

    if (hasMissingCredentials()) {
      toast({
        title: 'Please enter your credentials',
        description:
          'You need to enter your API keys to chat. Visit the "How it works" page.',
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

  //prevent empty submissions
  const handleEnter = (e: any) => {
    if (e.key === 'Enter' && query) {
      handleSubmit(e);
    } else if (e.key == 'Enter') {
      e.preventDefault();
    }
  };

  return (
    <>
      <Layout>
        <div className="mx-auto flex flex-col gap-4">
          <h1 className="text-2xl font-bold leading-[1.1] tracking-tighter text-center">
            Chat With Your Docs
          </h1>
          <main className={styles.main}>
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
