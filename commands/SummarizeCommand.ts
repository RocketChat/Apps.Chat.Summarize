import {
	IHttp,
	IModify,
	IRead,
} from '@rocket.chat/apps-engine/definition/accessors';
import { IRoom } from '@rocket.chat/apps-engine/definition/rooms';
import {
	ISlashCommand,
	SlashCommandContext,
} from '@rocket.chat/apps-engine/definition/slashcommands';
import { IUser } from '@rocket.chat/apps-engine/definition/users';
import { notifyMessage } from '../helpers/notifyMessage';
import { createTextCompletion } from '../helpers/createTextCompletion';
import { createSummaryPrompt } from '../constants/prompts';
import { App } from '@rocket.chat/apps-engine/definition/App';

export class SummarizeCommand implements ISlashCommand {
	public command = 'summarize-thread';
	public i18nParamsExample = 'Summarize messages in a thread';
	public i18nDescription = '';
	public providesPreview = false;
	private readonly app: App;

	constructor(app: App) {
		this.app = app;
	}

	public async executor(
		context: SlashCommandContext,
		read: IRead,
		modify: IModify,
		http: IHttp
	): Promise<void> {
		const user = context.getSender();
		const room = context.getRoom();
		const threadId = context.getThreadId();

		if (!threadId) {
			await notifyMessage(
				room,
				read,
				user,
				'You can only call /summarize-thread in a thread'
			);
			throw new Error('You can only call /summarize-thread in a thread');
		}

		const messages = await this.getThreadMessages(room, read, user, threadId);

		const prompt = createSummaryPrompt(messages);
		const summary = await createTextCompletion(
			this.app,
			room,
			read,
			user,
			http,
			prompt,
			threadId
		);

		await notifyMessage(room, read, user, summary, threadId);
	}

	private async getThreadMessages(
		room: IRoom,
		read: IRead,
		user: IUser,
		threadId: string
	) {
		const threadReader = read.getThreadReader();
		const thread = await threadReader.getThreadById(threadId);

		if (!thread) {
			await notifyMessage(room, read, user, 'Thread not found');
			throw new Error('Thread not found');
		}

		const messageTexts: string[] = [];
		for (const message of thread) {
			if (message.text) {
				messageTexts.push(`${message.sender.name}: ${message.text}`);
			}
		}

		// threadReader repeats the first message once, so here we remove it
		messageTexts.shift();
		return messageTexts.join('\n');
	}
}
