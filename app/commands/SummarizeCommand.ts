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
import {
	createAssignedTasksPrompt,
	createFileSummaryPrompt,
	createFollowUpQuestionsPrompt,
	createParticipantsSummaryPrompt,
	createPromptInjectionProtectionPrompt,
	createSummaryPrompt,
	createSummaryPromptByTopics,
	createUserHelpPrompt,
} from '../constants/prompts';
import { App } from '@rocket.chat/apps-engine/definition/App';
import { IMessageRaw } from '@rocket.chat/apps-engine/definition/messages';
import { WELCOME_MESSAGE } from '../constants/dialogue';

export class SummarizeCommand implements ISlashCommand {
	public command = 'chat-summary';
	public i18nParamsExample =
		'Summarize messages in a thread or channel [today|week|unread]';
	public i18nDescription =
		'Generates a summary of recent messages. Use "today", "week", or "unread" to filter the messages';
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

		const command = context.getArguments();
		const [subcommand] = context.getArguments();
		const filter = subcommand.toLowerCase();

		let unreadCount: number | undefined;
		let startDate: Date | undefined;
		const now = new Date();

		if (!subcommand) {
			startDate = undefined;
		} else {
			switch (filter) {
				case 'today':
					startDate = new Date(
						now.getFullYear(),
						now.getMonth(),
						now.getDate(),
						0,
						0,
						0,
						0
					);
					break;
				case 'week':
					startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
					break;
				case 'unread':
					unreadCount = await read
						.getUserReader()
						.getUserUnreadMessageCount(user.id);
					break;
				case 'help':
					break;
				default:
					await notifyMessage(
						room,
						read,
						user,
						`Please enter a valid command!
						
						You can try: 
						\t 1. /chat-summary
						\t 2. /chat-summary today
						\t 3. /chat-summary week
						\t 4. /chat-summary unread
						\t 4. /chat-summary help
						`
					);
					return;
			}
		}

		const addOns = await this.app
			.getAccessors()
			.environmentReader.getSettings()
			.getValueById('add-ons');
		const xAuthToken = await this.app
			.getAccessors()
			.environmentReader.getSettings()
			.getValueById('x-auth-token');
		const xUserId = await this.app
			.getAccessors()
			.environmentReader.getSettings()
			.getValueById('x-user-id');

		let helpResonse: string;
		if (filter === 'help') {
			await notifyMessage(room, read, user, WELCOME_MESSAGE, threadId);

			command.shift();
			const helpRequest = command.join(' ');
			
			const prompt = createUserHelpPrompt(helpRequest);
			helpResonse = await createTextCompletion(
				this.app,
				room,
				read,
				user,
				http,
				prompt,
				threadId
			);
			await notifyMessage(room, read, user, helpResonse, threadId);
			return;
		}

		let messages: string;
		if (!threadId) {
			messages = await this.getRoomMessages(
				room,
				read,
				user,
				http,
				addOns,
				xAuthToken,
				xUserId,
				startDate,
				unreadCount
			);
		} else {
			messages = await this.getThreadMessages(
				room,
				read,
				user,
				http,
				threadId,
				addOns,
				xAuthToken,
				xUserId,
				startDate,
				unreadCount
			);
		}

		await notifyMessage(room, read, user, messages, threadId);

		// const promptInjectionProtectionPrompt =
		// 	createPromptInjectionProtectionPrompt(messages);
		// const isPromptInjection = await createTextCompletion(
		// 	this.app,
		// 	room,
		// 	read,
		// 	user,
		// 	http,
		// 	promptInjectionProtectionPrompt,
		// 	threadId
		// );
		// if (isPromptInjection) {
		// 	await notifyMessage(
		// 		room,
		// 		read,
		// 		user,
		// 		'Prompt injection detected! You are not allowed to summarize messages that have potential attack to the AI model',
		// 		threadId
		// 	);
		// 	throw new Error('Prompt injection detected');
		// }

		let summary: string;
		if (!threadId) {
			const prompt = createSummaryPromptByTopics(messages);
			summary = await createTextCompletion(
				this.app,
				room,
				read,
				user,
				http,
				prompt,
				threadId
			);
		} else {
			const prompt = createSummaryPrompt(messages);
			summary = await createTextCompletion(
				this.app,
				room,
				read,
				user,
				http,
				prompt,
				threadId
			);
		}
		await notifyMessage(room, read, user, summary, threadId);

		if (addOns.includes('assigned-tasks')) {
			const assignedTasksPrompt = createAssignedTasksPrompt(messages);
			const assignedTasks = await createTextCompletion(
				this.app,
				room,
				read,
				user,
				http,
				assignedTasksPrompt,
				threadId
			);
			await notifyMessage(room, read, user, assignedTasks, threadId);
		}

		if (addOns.includes('follow-up-questions')) {
			const followUpQuestionsPrompt = createFollowUpQuestionsPrompt(messages);
			const followUpQuestions = await createTextCompletion(
				this.app,
				room,
				read,
				user,
				http,
				followUpQuestionsPrompt,
				threadId
			);
			await notifyMessage(room, read, user, followUpQuestions, threadId);
		}

		if (addOns.includes('participants-summary')) {
			const participantsSummaryPrompt =
				createParticipantsSummaryPrompt(messages);
			const participantsSummary = await createTextCompletion(
				this.app,
				room,
				read,
				user,
				http,
				participantsSummaryPrompt,
				threadId
			);
			await notifyMessage(room, read, user, participantsSummary, threadId);
		}
	}

	private async getFileSummary(
		fileId: string,
		read: IRead,
		room: IRoom,
		user: IUser,
		http: IHttp,
		xAuthToken: string,
		xUserId: string,
		threadId?: string
	): Promise<string> {
		const uploadReader = read.getUploadReader();
		const file = await uploadReader.getById(fileId);
		if (file && file.type === 'text/plain') {
			const response = await fetch(file.url, {
				method: 'GET',
				headers: {
					'X-Auth-Token': xAuthToken,
					'X-User-Id': xUserId,
				},
			});
			const fileContent = await response.text();
			const fileSummaryPrompt = createFileSummaryPrompt(fileContent);
			return createTextCompletion(
				this.app,
				room,
				read,
				user,
				http,
				fileSummaryPrompt,
				threadId
			);
		}
		return 'File type is not supported';
	}

	private async getRoomMessages(
		room: IRoom,
		read: IRead,
		user: IUser,
		http: IHttp,
		addOns: string[],
		xAuthToken: string,
		xUserId: string,
		startDate?: Date,
		unreadCount?: number
	): Promise<string> {
		const messages: IMessageRaw[] = await read
			.getRoomReader()
			.getMessages(room.id, {
				limit: Math.min(unreadCount || 100, 100),
				sort: { createdAt: 'asc' },
			});

		let filteredMessages = messages;
		if (startDate) {
			const today = new Date();
			filteredMessages = messages.filter((message) => {
				const createdAt = new Date(message.createdAt);
				return createdAt >= startDate && createdAt <= today;
			});
		}

		const messageTexts: string[] = [];
		for (const message of filteredMessages) {
			if (message.text) {
				messageTexts.push(
					`Message at ${message.createdAt}\n${message.sender.name}: ${message.text}\n`
				);
			}
			if (addOns.includes('file-summary') && message.file) {
				if (!xAuthToken || !xUserId) {
					await notifyMessage(
						room,
						read,
						user,
						'Personal Access Token and User ID must be filled in settings to enable file summary add-on'
					);
					continue;
				}
				const fileSummary = await this.getFileSummary(
					message.file._id,
					read,
					room,
					user,
					http,
					xAuthToken,
					xUserId
				);
				messageTexts.push('File Summary: ' + fileSummary);
			}
		}
		return messageTexts.join('\n');
	}

	private async getThreadMessages(
		room: IRoom,
		read: IRead,
		user: IUser,
		http: IHttp,
		threadId: string,
		addOns: string[],
		xAuthToken: string,
		xUserId: string,
		startDate?: Date,
		unreadCount?: number
	): Promise<string> {
		const threadReader = read.getThreadReader();
		const thread = await threadReader.getThreadById(threadId);

		if (!thread) {
			await notifyMessage(room, read, user, 'Thread not found');
			throw new Error('Thread not found');
		}

		let filteredMessages = thread;
		if (startDate) {
			const today = new Date();
			filteredMessages = thread.filter((message) => {
				if (!message.createdAt) return false;
				const createdAt = new Date(message.createdAt);
				return createdAt >= startDate && createdAt <= today;
			});
		}

		if (unreadCount && unreadCount > 0) {
			if (unreadCount > 100) {
				unreadCount = 100;
			}
			filteredMessages = filteredMessages.slice(-unreadCount);
		}

		const messageTexts: string[] = [];
		for (const message of filteredMessages) {
			if (message.text) {
				messageTexts.push(`${message.sender.name}: ${message.text}`);
			}
			if (addOns.includes('file-summary') && message.file) {
				if (!xAuthToken || !xUserId) {
					await notifyMessage(
						room,
						read,
						user,
						'Personal Access Token and User ID must be filled in settings to enable file summary add-on'
					);
					continue;
				}
				const fileSummary = await this.getFileSummary(
					message.file._id,
					read,
					room,
					user,
					http,
					xAuthToken,
					xUserId,
					threadId
				);
				messageTexts.push('File Summary: ' + fileSummary);
			}
		}

		// threadReader repeats the first message once, so here we remove it
		messageTexts.shift();
		return messageTexts.join('\n');
	}
}
