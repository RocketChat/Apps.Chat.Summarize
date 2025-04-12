import {
	IHttp,
	IHttpResponse,
	IRead,
} from '@rocket.chat/apps-engine/definition/accessors';
import { IRoom } from '@rocket.chat/apps-engine/definition/rooms';
import { IUser } from '@rocket.chat/apps-engine/definition/users';
import { notifyMessage } from './notifyMessage';
import { App } from '@rocket.chat/apps-engine/definition/App';
import { SettingEnum } from '../settings/settings';

export async function createTextCompletion(
	app: App,
	room: IRoom,
	read: IRead,
	user: IUser,
	http: IHttp,
	prompt: string,
	threadId?: string
): Promise<string> {
	const model = await read
		.getEnvironmentReader()
		.getSettings()
		.getValueById(SettingEnum.AI_MODEL_NAME);

	const host = await read
		.getEnvironmentReader()
		.getSettings()
		.getValueById(SettingEnum.AI_MODEL_API_URL);

	const apiKey = await read
		.getEnvironmentReader()
		.getSettings()
		.getValueById(SettingEnum.AI_API_KEY);

	if (!host) {
		await notifyMessage(
			room,
			read,
			user,
			'Your Workspace AI is not set up properly. Please contact your administrator',
			threadId
		);
		throw new Error(
			'Your Workspace AI is not set up properly. Please contact your administrator'
		);
	}

	const body = {
		model,
		messages: [
			{
				role: 'system',
				content: prompt,
			},
		],
		temperature: 0,
	};

	try {
		const response: IHttpResponse = await http.post(
			`${host}/v1/chat/completions`,
			{
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${apiKey}`,
				},
				content: JSON.stringify(body),
			}
		);

		if (!response || !response.data) {
            app.getLogger().log('No response data received from AI.');
			return 'Something went wrong. Please try again later.';
		}

		const { choices } = response.data;
		return choices[0].message.content;
	} catch (error) {
		app.getLogger().log(`Error in createTextCompletion: ${error.message}`);
		return 'Something went wrong. Please try again later.';
	}
}
