import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { urlPattern } from '@/utils/helpers';
import { Loader2 } from 'lucide-react';
import { useCredentialsCookie } from '@/context/credentials-context';

interface WebUploadProps {
  handleUrlUpload: () => void;
  isUploadingUrl: boolean;
  handleUrlChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  url: string;
}

export function WebUpload({
  handleUrlUpload,
  isUploadingUrl,
  handleUrlChange,
  url,
}: WebUploadProps) {
  const { cookieValue } = useCredentialsCookie();

  const handleEnter = (e: any) => {
    if (e.key === 'Enter') {
      handleUrlUpload();
    }
  };

  const hasMissingCredentials = () => {
    return (
      !cookieValue?.openaiApiKey ||
      !cookieValue?.pineconeApiKey ||
      !cookieValue?.pineconeEnvironment ||
      !cookieValue?.pineconeIndex
    );
  };
  return (
    <div className="max-w-md w-full mt-10">
      <h2 className="mt-10 scroll-m-20 border-b border-b-slate-100 pb-2 text-lg font-semibold tracking-tight transition-colors first:mt-0 dark:border-b-slate-300">
        Insert a Website Url
      </h2>
      <div className="flex w-fullitems-center space-x-2">
        <Input
          type="text"
          placeholder="https://openai.com/blog/chatgpt"
          className="w-full"
          onChange={handleUrlChange}
          value={url}
        />
        <Button
          type="button"
          onClick={handleUrlUpload}
          disabled={
            isUploadingUrl || url.length === 0 || !urlPattern.test(url)
            // hasMissingCredentials()
          }
        >
          {isUploadingUrl && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Search
        </Button>
      </div>
    </div>
  );
}
