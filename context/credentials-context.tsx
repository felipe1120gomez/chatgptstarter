import { createContext, useContext, useEffect, useState } from 'react';
import cookies from 'js-cookie';

const credentials_cookie_key = 'credentials';

type Credentials = {
  openaiApiKey: string;
  pineconeEnvironment: string;
  pineconeIndex: string;
  pineconeApiKey: string;
};

type CredentialsCookieContextType = {
  cookieValue: Credentials | null;
  setAndSaveCookieValue: (value: Credentials) => void;
};

type CredentialsCookieProviderProps = {
  children: React.ReactNode;
};

const initialCredentials = {
  openaiApiKey: '',
  pineconeEnvironment: '',
  pineconeIndex: '',
  pineconeApiKey: '',
};

const CredentailsCookieContext = createContext<CredentialsCookieContextType>({
  cookieValue: null,
  setAndSaveCookieValue: () => {},
});

export function CredentialsCookieProvider({
  children,
}: CredentialsCookieProviderProps) {
  const [cookieValue, setCookieValue] = useState(initialCredentials);

  useEffect(() => {
    const valuesFromCookie = cookies.get(credentials_cookie_key);

    if (valuesFromCookie) {
      try {
        const parsedValue = JSON.parse(valuesFromCookie);
        setCookieValue(parsedValue);
      } catch (error) {
        console.error('Error parsing cookie value:', error);
      }
    }
  }, []);

  const setAndSaveCookieValue = (value: any) => {
    cookies.set(credentials_cookie_key, JSON.stringify(value), { expires: 7 });
    setCookieValue(value);
  };

  return (
    <CredentailsCookieContext.Provider
      value={{ cookieValue, setAndSaveCookieValue }}
    >
      {children}
    </CredentailsCookieContext.Provider>
  );
}

export function useCredentialsCookie() {
  return useContext(CredentailsCookieContext);
}
