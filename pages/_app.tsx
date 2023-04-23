import '@/styles/base.css';
import type { AppProps } from 'next/app';
import { Toaster } from '@/components/ui/toaster';
import { CredentialsCookieProvider } from '@/context/credentials-context';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <CredentialsCookieProvider>
        <Component {...pageProps} />
        <Toaster />
      </CredentialsCookieProvider>
    </>
  );
}

export default MyApp;
