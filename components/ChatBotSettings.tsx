import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { Credentials } from './Credentials';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useCredentialsCookie } from '@/context/credentials-context';
import { useRouter } from 'next/router';
import { Loader2 } from 'lucide-react';

export function ChatBotSettings() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const { cookieValue } = useCredentialsCookie();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (router.pathname === '/chatbot') {
      setIsOpen(true);
    }
  }, [router.pathname]);

  //event type is React.MouseEvent<HTMLButtonElement, MouseEvent>

  const handleUploadClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    router.push('/');
  };

  function hasMissingCredentials() {
    return (
      !cookieValue ||
      !cookieValue.openaiApiKey ||
      !cookieValue.pineconeApiKey ||
      !cookieValue.pineconeEnvironment ||
      !cookieValue.pineconeIndex
    );
  }

  const handleNameSpaceDeletion = async () => {
    if (hasMissingCredentials()) {
      toast({
        title: 'Please enter your credentials',
        description: 'You need to enter your API keys to upload files.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/delete-namespace', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({
          credentials: cookieValue,
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
        setLoading(false);
        return;
      }

      toast({
        title: 'Success',
        description: 'Your namespace has been deleted',
        variant: 'default',
      });
      setLoading(false);
      setIsOpen(false);
      router.push('/');
    } catch (error) {
      setLoading(false);
      console.log('error', error);
    }
  };

  return (
    <>
      <div className="space-x-2">
        <Dialog open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
          <DialogTrigger asChild>
            <Button variant="outline">Modify Files </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Upload or Delete Files</DialogTitle>
              <DialogDescription>
                <b className="font-bold">
                  If you do not need to upload or delete files, you can close
                  this window.
                </b>
                <br></br>
                Make sure you have already uploaded a file or website url before
                using the chat. If not, click {'upload new document'}.<br></br>
                <br />
                If you have already uploaded but prefer to use a new file or
                website url, please click {'delete document'} first before
                re-uploading.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button type="button" onClick={handleNameSpaceDeletion}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete document
              </Button>
              <Button type="button" onClick={handleUploadClick}>
                Upload new document
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Credentials />
      </div>
    </>
  );
}
