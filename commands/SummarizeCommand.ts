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

export class SummarizeCommand implements ISlashCommand {
    public command = 'summarize-thread';
    public i18nParamsExample = 'Summarize messages in a thread';
    public i18nDescription = '';
    public providesPreview = false;

    public async executor(context: SlashCommandContext, read: IRead, modify: IModify, http: IHttp): Promise<void> {
        const user = context.getSender()
        const room = context.getRoom()
        const threadId = context.getThreadId()

        if (!threadId) {
            await this.notifyMessage(room, read, user, 'You can only call /summarize-thread in a thread')
            throw new Error('You can only call /summarize-thread in a thread')
        }

        await this.notifyMessage(room, read, user, threadId)
        const threadReader = read.getThreadReader()
        // TODO: find out why always return undefined
        const thread = await threadReader.getThreadById(threadId)

        if (!thread) {
            await this.notifyMessage(room, read, user, 'Thread not found')
            throw new Error('Thread not found')
        }

        const messageTexts: string[] = []
        for (const message of thread) {
            if (message.text) {
                messageTexts.push(message.text)
            }
        }

        await this.notifyMessage(room, read, user, messageTexts.join(', '), threadId)
    }

    private async notifyMessage(room: IRoom, read: IRead, sender: IUser, message: string, threadId?: string): Promise<void> {
        const notifier = read.getNotifier()

        const messageBuilder = notifier.getMessageBuilder()
        messageBuilder.setText(message)
        messageBuilder.setRoom(room)

        if (threadId) {
            messageBuilder.setThreadId(threadId)
        }

        return notifier.notifyUser(sender, messageBuilder.getMessage())
    }
}
