import React, { useEffect, useState } from 'react';
import { useCredentialsCookie } from '@/context/credentials-context';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { FileKey } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function Credentials() {
  const { cookieValue, setAndSaveCookieValue } = useCredentialsCookie() as any;
  const [openaiApiKey, setOpenaiApiKey] = useState(cookieValue.openaiApiKey);
  const [pineconeEnvironment, setPineconeEnvironment] = useState(
    cookieValue.pineconeEnvironment,
  );
  const [pineconeIndex, setPineconeIndex] = useState(cookieValue.pineconeIndex);
  const [pineconeApiKey, setPineconeApiKey] = useState(
    cookieValue.pineconeApiKey,
  );

  useEffect(() => {
    if (cookieValue) {
      setOpenaiApiKey(cookieValue.openaiApiKey);
      setPineconeEnvironment(cookieValue.pineconeEnvironment);
      setPineconeIndex(cookieValue.pineconeIndex);
      setPineconeApiKey(cookieValue.pineconeApiKey);
    }
  }, [cookieValue]);

  const handleOpenaiApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOpenaiApiKey(e.target.value);
  };
  const handlePineconeEnvironmentChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setPineconeEnvironment(e.target.value);
  };
  const handlePineconeIndexChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setPineconeIndex(e.target.value);
  };
  const handlePineconeApiKeyChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    console.log('e.target.value', e.target.value);

    setPineconeApiKey(e.target.value);
  };

  const handleSaveCredentials = () => {
    setAndSaveCookieValue({
      openaiApiKey,
      pineconeEnvironment,
      pineconeIndex,
      pineconeApiKey,
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <FileKey className="mr-2 h-4 w-4" />
          Add Your Credentials to Use the App
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Add credentials to use the App</DialogTitle>
          <DialogDescription>
            Your credentials are required to make API calls to OpenAI and
            Pinecone. They will be saved in browser cookie and expire in 7 days,
            but your data will never be stored anywhere in the server.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="openai-api-key" className="text-right">
              OpenAI API Key
            </Label>
            <Input
              id="openai-api-key"
              value={openaiApiKey}
              placeholder="sk-***************************"
              className="col-span-3"
              onChange={handleOpenaiApiKeyChange}
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="pinecone-api-key" className="text-right">
              Pinecone API Key
            </Label>
            <Input
              id="pinecone-api-key"
              value={pineconeApiKey}
              placeholder="*****-****-****"
              className="col-span-3"
              onChange={handlePineconeApiKeyChange}
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="pinecone-environment" className="text-right">
              Pinecone Environment
            </Label>
            <Input
              id="pinecone-environment"
              value={pineconeEnvironment}
              placeholder="Insert your pinecone environment"
              className="col-span-3"
              onChange={handlePineconeEnvironmentChange}
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="pinecone-index" className="text-right">
              Pinecone Index Name
            </Label>
            <Input
              id="pinecone-index"
              value={pineconeIndex}
              placeholder="Insert your pinecone index"
              className="col-span-3"
              onChange={handlePineconeIndexChange}
            />
          </div>
        </div>
        <DialogPrimitive.Close asChild>
          <Button onClick={handleSaveCredentials}>Save changes</Button>
        </DialogPrimitive.Close>
      </DialogContent>
    </Dialog>
  );
}
