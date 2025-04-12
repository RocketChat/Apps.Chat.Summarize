import {
	IHttp,
	IModify,
	IRead,
} from '@rocket.chat/apps-engine/definition/accessors';
import {
	ISlashCommand,
	SlashCommandContext,
} from '@rocket.chat/apps-engine/definition/slashcommands';
import { notifyMessage } from '../helpers/notifyMessage';
import { createTextCompletion } from '../helpers/createTextCompletion';
import {

	createUserHelpPrompt,
} from '../constants/prompts';
import {
	FREQUENTLY_ASKED_QUESTIONS,
	WELCOME_MESSAGE,
} from '../constants/dialogue';
import { getStartDate, handleSummaryGeneration } from '../helpers/summarizeHelper';
import { ThreadSummarizerApp } from '../ThreadSummarizerApp';

export class SummarizeCommand implements ISlashCommand {
	public command = 'chat-summary';
	public i18nParamsExample =
		'Summarize messages in a thread or channel [today|week|unread]';
	public i18nDescription =
		'Generates a summary of recent messages. Use "today", "week", or "unread" to filter the messages';
	public providesPreview = false;
	private readonly app: ThreadSummarizerApp;

	constructor(app: ThreadSummarizerApp) {
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
		const filter = subcommand ? subcommand.toLowerCase() : '';
        const now = new Date();
        const startDate = getStartDate(filter, now);
        const anyMatchedUsername = false

        let helpResponse: string;
		if (filter === 'help') {
			if (subcommand === command.join(' ')) {
				await notifyMessage(room, read, user, WELCOME_MESSAGE, threadId);
				await notifyMessage(
					room,
					read,
					user,
					FREQUENTLY_ASKED_QUESTIONS,
					threadId
				);
				return;
			}

			command.shift();
			const helpRequest = command.join(' ');

			const prompt = createUserHelpPrompt(
				FREQUENTLY_ASKED_QUESTIONS,
				helpRequest
			);
			helpResponse = await createTextCompletion(
				this.app,
				room,
				read,
				user,
				http,
				prompt,
				threadId
			);
			await notifyMessage(room, read, user, helpResponse, threadId);
			return;
		}

        if(!subcommand){
            await handleSummaryGeneration(this.app, read, http, room, user, threadId, startDate, undefined, undefined, anyMatchedUsername );
        } else{
            const usernames:string[] | undefined = (['today', 'week', 'unread'].includes(filter) && subcommand) ? undefined : command.map(name => name.replace(/^@/, ''));

        const unreadCount = filter === 'unread' ? await read.getUserReader().getUserUnreadMessageCount(user.id) : undefined;

        await handleSummaryGeneration(this.app, read, http, room, user, threadId, startDate, unreadCount, usernames, anyMatchedUsername);
        }
    }

}
