import { BasePromptTemplate } from 'langchain/dist';

interface qaChainParams {
  prompt?: BasePromptTemplate;
  combineMapPrompt?: BasePromptTemplate;
  combinePrompt?: BasePromptTemplate;
  type?: string;
}
