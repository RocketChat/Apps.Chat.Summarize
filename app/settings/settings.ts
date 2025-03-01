import {
	ISetting,
	SettingType,
} from '@rocket.chat/apps-engine/definition/settings';

export enum SettingEnum {
    AI_PROVIDER_OPTION_ID = 'ai-provider-option-id',
	MODEL_SELECTION = 'model-selection',
    ROCKETCHAT_INTERNAL_MODEL = "internal-llm",
    AI_MODEL_API_URL = 'api-url',
	AI_API_KEY = "api-key",
	AI_MODEL_NAME = 'ai-model-name',
	SELF_HOSTED_MODEL = 'self-hosted-model',
	OPEN_AI = 'open-ai',
	GEMINI = 'gemini',
    LLAMA3_8B = 'llama3-8b',
    MISTRAL_7B = 'mistral-7b',
}

export const settings: ISetting[] = [
    {
		id: SettingEnum.AI_PROVIDER_OPTION_ID,
		type: SettingType.SELECT,
		packageValue: SettingEnum.ROCKETCHAT_INTERNAL_MODEL,
		required: true,
		public: false,
		i18nLabel: 'Choose AI Provider',
		values: [
            {
				key: SettingEnum.ROCKETCHAT_INTERNAL_MODEL,
				i18nLabel: 'RocketChat Internal LLM',
			},
			{
				key: SettingEnum.SELF_HOSTED_MODEL,
				i18nLabel: 'Ollama Self Hosted',
			},
			{
				key: SettingEnum.OPEN_AI,
				i18nLabel: 'OpenAI & OpenAI API-Compatible LLM Provider (Together, Groq etc.)',
			},
			{
				key: SettingEnum.GEMINI,
				i18nLabel: 'Gemini',
			},
		],
	},
	{
		id: SettingEnum.MODEL_SELECTION,
		i18nLabel: 'Model selection',
		i18nDescription: 'AI model to use for summarization.(For RocketChat Internal LLM)',
		type: SettingType.SELECT,
		values: [
			{ key: SettingEnum.LLAMA3_8B, i18nLabel: 'Llama3 8B' },
			{ key: SettingEnum.MISTRAL_7B, i18nLabel: 'Mistral 7B' },
		],
		required: true,
		public: true,
		packageValue: SettingEnum.LLAMA3_8B,
	},
    {
		id: SettingEnum.AI_MODEL_API_URL,
		type: SettingType.STRING,
		packageValue: '',
		required: true,
		public: false,
		i18nLabel: 'AI model api url',
	},
    {
		id: SettingEnum.AI_API_KEY,
		type: SettingType.PASSWORD,
		packageValue: '',
		required: true,
		public: false,
		i18nLabel: 'AI API key',
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
