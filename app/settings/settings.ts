import {
	ISetting,
	SettingType,
} from '@rocket.chat/apps-engine/definition/settings';

export enum SettingEnum {
    // Core configuration for AI provider selection
    AI_PROVIDER_OPTION_ID = 'ai-provider-option-id',
    MODEL_SELECTION = 'model-selection',
    // Supported AI providers
    ROCKETCHAT_INTERNAL_MODEL = "internal-llm",
    SELF_HOSTED_MODEL = 'self-hosted-model',
    OPEN_AI = 'open-ai',
    GEMINI = 'gemini',
    // Specific model identifiers
    LLAMA3_8B = 'llama3-8b',
    MISTRAL_7B = 'mistral-7b',
    // API connection parameters
    AI_MODEL_API_URL = 'api-url',
    AI_API_KEY = "api-key",
    AI_MODEL_NAME = 'ai-model-name',
}


export const settings: ISetting[] = [
      // AI Provider Configuration
    {
		id: SettingEnum.AI_PROVIDER_OPTION_ID,
		type: SettingType.SELECT,
		packageValue: SettingEnum.ROCKETCHAT_INTERNAL_MODEL,
		required: true,
		public: false,
		i18nLabel: 'Choose AI Provider',
		values: [
            {
				key: SettingEnum.ROCKETCHAT_INTERNAL_MODEL, //Rocket.Chat's built-in LLM
				i18nLabel: 'RocketChat Internal LLM',
			},
			{
				key: SettingEnum.SELF_HOSTED_MODEL, //Self-hosted Ollama instance
				i18nLabel: 'Ollama Self Hosted',
			},
			{
				key: SettingEnum.OPEN_AI, //OpenAI-compatible API endpoints
				i18nLabel: 'OpenAI & OpenAI API-Compatible LLM Provider (Together, Groq etc.)',
			},
			{
				key: SettingEnum.GEMINI, //Google's Gemini Provider
				i18nLabel: 'Gemini',
			},
		],
	},
    //Rocket.Chat Internal LLM Model Selection Specific Settings
	{
		id: SettingEnum.MODEL_SELECTION,
		i18nLabel: 'Model selection',
		i18nDescription: 'Required for RocketChat Internal LLM',
		type: SettingType.SELECT,
		values: [
			{ key: SettingEnum.LLAMA3_8B, i18nLabel: 'Llama3 8B' },
			{ key: SettingEnum.MISTRAL_7B, i18nLabel: 'Mistral 7B' },
		],
		required: false,
		public: true,
		packageValue: SettingEnum.LLAMA3_8B,
	},
    //API Connection Settings
    {
        id: SettingEnum.AI_MODEL_API_URL,
        type: SettingType.STRING,
        packageValue: '',
        required: false,
        public: false,
        i18nLabel: 'AI Model API URL',
        i18nDescription: 'Must be filled to use OpenAI and self-hosted models',
    },
    {
        id: SettingEnum.AI_API_KEY,
        type: SettingType.PASSWORD,
        packageValue: '',
        required: false,
        public: false,
        i18nLabel: 'AI API Key',
        i18nDescription: 'Must be filled to use OpenAI and Gemini models',
    },
    {
		id: SettingEnum.AI_MODEL_NAME,
		type: SettingType.STRING,
		packageValue: '',
		required: true,
		public: false,
		i18nLabel: 'AI model name',
	},
	{
		id: 'add-ons',
		i18nLabel: 'Summary add-ons',
		i18nDescription: 'Additional features to enable for the summary command',
		type: SettingType.MULTI_SELECT,
		values: [
			{ key: 'assigned-tasks', i18nLabel: 'Assigned tasks' },
			{ key: 'follow-up-questions', i18nLabel: 'Follow-up questions' },
			{ key: 'participants-summary', i18nLabel: 'Participants summary' },
			{ key: 'file-summary', i18nLabel: 'File summary' },
		],
		required: false,
		public: true,
		packageValue: '',
	},
	{
		id: 'x-auth-token',
		i18nLabel: 'Personal Access Token',
		i18nDescription: 'Must be filled to enable file summary add-on',
		type: SettingType.STRING,
		required: false,
		public: true,
		packageValue: '',
	},
	{
		id: 'x-user-id',
		i18nLabel: 'User ID',
		i18nDescription: 'Must be filled to enable file summary add-on',
		type: SettingType.STRING,
		required: false,
		public: true,
		packageValue: '',
	},
];
