# GPT-4 & LangChain - Create a ChatGPT Chatbot for Your PDF Files

Use the new GPT-4 api to build a chatGPT chatbot for multiple Large PDF files.

Tech stack used includes LangChain, Pinecone, Typescript, Openai, and Next.js. LangChain is a framework that makes it easier to build scalable AI/LLM apps and chatbots. Pinecone is a vectorstore for storing embeddings and your PDF in text to later retrieve similar docs.

The visual guide of this repo and tutorial is in the `visual guide` folder.

**If you run into errors, please review the troubleshooting section further down this page.**

## Development

1. Make sure you have installed node and yarn

[Node installation](https://nodejs.org/en/download)

Yarn installation in your terminal after installing node

`npm install -g yarn`

Check that both are installed.

```
node -v
yarn -v
```

Node must be at least version 18.x.x

Clone the repo

2. Install packages

```
yarn install
```

You should see a `node_modules` folder afterwards.

3. In the `config` folder, replace the `PINECONE_NAME_SPACE` with a `namespace` where you'd like to store your embeddings on Pinecone when you run `npm run ingest` manually or use the `api/ingest` via uploading on the frontend. This namespace will later be used for queries and retrieval.

---

## If you want to "ingest" manually

---

Set up your `.env` file and insert credentials

- Copy `.env.example` into `.env`
  Your `.env` file should look like this:

```
OPENAI_API_KEY=

PINECONE_API_KEY=
PINECONE_ENVIRONMENT=

PINECONE_INDEX_NAME=

```

- Visit [openai](https://help.openai.com/en/articles/4936850-where-do-i-find-my-secret-api-key) to retrieve API keys and insert into your `.env` file.
- Visit [pinecone](https://pinecone.io/) to create and retrieve your API keys, and also retrieve your environment and index name from the dashboard.

### Convert your PDF files to embeddings

**This repo can load multiple PDF files**

1. Inside `docs` folder, add your pdf files or folders that contain pdf files.

2. Run the script `npm run ingest` to 'ingest' and embed your docs. If you run into errors troubleshoot below.

3. Check Pinecone dashboard to verify your namespace and vectors have been added.

**You can also manually ingest other file types by adding more loaders to the `DirectoryLoader`**

### Chat with your docs

Run `npm run dev` to load `localhost:3000`, then visit the `Chatbot` page to chat with your docs.

---

## If you want to "ingest" via the UI upload

---

If you would prefer to use the UI upload in `upload` page, you don't need to `.env` file.

First, run `npm run dev` to load `localhost:3000`, then click on `Add credentials` to input your key credentials. Then click `Save.`

Drag or upload a file into the upload area and then click `upload`. You should then be redirected to the chatbot.

## Adapting for your use case

In `utils/makechain.ts` chain change the `QA_PROMPT` prompt for your own usecase. Change `modelName` in `OpenAI` to `gpt-4`, if you have access `gpt-4` api.

## Troubleshooting

**General errors**

- Make sure you're running the latest Node version. Run `node -v`
- Make sure you're using the same versions of LangChain and Pinecone as this repo.
- Check that you've created an `.env` file that contains your valid (and working) API keys, environment and index name.
- If you change `modelName` in `OpenAI` note that you need access to `gpt-4` for it to work.
- Make sure you have access to `gpt-4` if you decide to use it. Test your openAI keys outside the repo and make sure it works and that you have enough API credits.
- Your pdf file is corrupted and cannot be parsed.

**Pinecone errors**

- Make sure your pinecone dashboard `environment` and `index` matches the one in the `pinecone.ts` and `.env` files.
- Check that you've set the vector dimensions to `1536`.
- Make sure your pinecone namespace is in lowercase.
- Pinecone indexes of users on the Starter(free) plan are deleted after 7 days of inactivity. To prevent this, send an API request to Pinecone to reset the counter.
- Retry from scratch with a new Pinecone index and cloned repo.

## Deployment

## Key files

`config/fileuploadconfig.ts`: Controls to the maxfilesize and maxnumberfiles allowed per upload. These settings are preconfigured for Vercel serveless function limits.

`utils/extractTextFromFiles.ts`: handles the logic for 'loading' various file types.

`utils/manualPDFLoader.ts`: this file is used for the manual ingest process run in `ingest-data.ts`

`utils/customPDFLoader`: The PDF 'loader' that parses the uploaded files into LangChain `Documents`. Modify the `metadata` as required.

`utils/formidable.ts`: Responsible for parsing uploading files.

`utils/makechain.ts`: Logic responsible for combining question to standalone question, retrieving relevant docs and then outputting a final result. Change the `OpenAIChat` `modelName` to `gpt-3.5-turbo` if you don't have access to `gpt-4`. Modify the `QA_Prompt` for your use case.

`utils/pinecone-client.ts`: The pinecone client that takes credentials from the UI.

`utils/pinecone-local-client.ts`: The pinecone client that uses the credentials from the `.env` file.

`api/ingest.ts`: Api route responsible for 'ingesting' the uploaded files.

`api/ingest-url.ts`: Api route responsible for 'ingesting' uploaded url.

`api/delete-namespace.ts`: Api route responsible for delete the specified namespace from the index. Use the `pinecone-local-client.ts`

`api/chat.ts`: Api route responsible for the 'chat' process, including retrieval of relevant documents.

`pages/credentials.tsx`: Main page for uploading credentials from the UI.

`components/FileUploadArea.tsx`: The file upload drop area. Modify the accepted files here as well the number of files allowed and max file size.

`public`: In the public folder you can change the default images of bot and user. Make sure to change the file names in the frontend `components/chat.tsx` as well:

For example:

```
<Image
    key={index}
    src="/bot-image.png" //change this to your new image name in public folder

```

## Deployment

**Please note that eslint and typescript errors are ignored in the `next.config.js` file by default. If you would like to throw errors during production build remove these configs**

There are a couple of high-level options for deploying your app:

a.
Deploying to a VM or container
Persistent filesystem means you can save and load files from disk
Always-running process means you can cache some things in memory
You can support long-running requests, such as WebSockets

b.
Deploying to a serverless environment
No persistent filesystem means you can load files from disk, but not save them for later
Cold start means you can't cache things in memory and expect them to be cached between requests
Function timeouts mean you can't support long-running requests, such as WebSockets
Some other considerations include:

Options:

- [Vercel](https://vercel.com/docs/concepts/deployments/overview)
- [Fly.io](https://fly.io/)
- [Render](https://render.com/docs/deploy-to-render)

## Credits

[chat-langchainjs](https://github.com/sullivan-sean/chat-langchainjs/tree/main)
