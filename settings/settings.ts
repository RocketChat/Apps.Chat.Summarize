import {
	ISetting,
	SettingType,
} from '@rocket.chat/apps-engine/definition/settings';

export const settings: ISetting[] = [
	{
		id: 'model',
		i18nLabel: 'Model selection',
		i18nDescription: 'AI model to use for summarization.',
		type: SettingType.SELECT,
		values: [
			{ key: 'llama3-70b', i18nLabel: 'Llama3 70B' },
			{ key: 'mistral-7b', i18nLabel: 'Mistral 7B' },
		],
		required: true,
		public: true,
		packageValue: 'llama3-70b',
	},
];
