import {
	ISetting,
	SettingType,
} from '@rocket.chat/apps-engine/definition/settings';

export enum SettingEnum {
	// Core configuration for AI provider selection
	AI_PROVIDER_OPTION_ID = 'ai-provider-option-id',
	MODEL_SELECTION = 'model-selection',
	// API connection parameters
	AI_MODEL_API_URL = 'api-url',
	AI_API_KEY = 'api-key',
	AI_MODEL_NAME = 'ai-model-name',
}

export const settings: ISetting[] = [
	//API Connection Settings
	{
		id: SettingEnum.AI_MODEL_API_URL,
		type: SettingType.STRING,
		packageValue: 'http://llama3-8b',
		required: true,
		public: false,
		i18nLabel: 'Model API Host URL',
		i18nDescription:
			'Host URL for the AI model API. API calls will be made to `{settings_value}/v1/chat/completions`',
	},
	{
		id: SettingEnum.AI_MODEL_NAME,
		type: SettingType.STRING,
		packageValue: 'llama3-8b',
		required: false,
		public: false,
		i18nLabel: 'AI model name',
	},
	{
		id: SettingEnum.AI_API_KEY,
		type: SettingType.PASSWORD,
		packageValue: 'sk_12c3456789abcdefg',
		required: false,
		public: false,
		i18nLabel: 'API Key',
		i18nDescription: 'API Key for the AI model',
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
