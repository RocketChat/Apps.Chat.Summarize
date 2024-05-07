import {
    IHttp,
    IModify,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import {
    ISlashCommand,
    SlashCommandContext,
} from "@rocket.chat/apps-engine/definition/slashcommands";
import { IUser } from "@rocket.chat/apps-engine/definition/users";

export class SummarizeCommand implements ISlashCommand {
    public command = "summarize-thread";
    public i18nParamsExample = "Summarize messages in a thread";
    public i18nDescription = "";
    public providesPreview = false;

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
            await this.notifyMessage(
                room,
                read,
                user,
                "You can only call /summarize-thread in a thread"
            );
            throw new Error("You can only call /summarize-thread in a thread");
        }

        const messages = await this.getThreadMessages(
            room,
            read,
            user,
            threadId
        );

        const summary = await this.summarizeMessages(
            room,
            read,
            user,
            http,
            messages
        );

        await this.notifyMessage(room, read, user, summary, threadId);
    }

    private async summarizeMessages(
        room: IRoom,
        read: IRead,
        user: IUser,
        http: IHttp,
        messages: string
    ): Promise<string> {
        const url = "http://mistral-7b/v1"
        const model = "mistral"

        const body = {
            model,
            messages: [
                {
                    role: "system",
                    content: `You are an assistant that helps Rocket.Chat users quickly understand what people have been talking about in a thread.
                        Briefly summarize the messages in the thread, which are separated by double slashes (//): ${messages}`,
                },
            ],
            temperature: 0,
        };

        const response = await http.post(url + "/chat/completions", {
            headers: {
                "Content-Type": "application/json",
            },
            content: JSON.stringify(body),
        });

        if (!response.content) {
            await this.notifyMessage(
                room,
                read,
                user,
                "Something is wrong with AI. Please try again later"
            );
            throw new Error(
                "Something is wrong with AI. Please try again later"
            );
        }

        return JSON.parse(response.content).choices[0].message.content;
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
            await this.notifyMessage(room, read, user, "Thread not found");
            throw new Error("Thread not found");
        }

        const messageTexts: string[] = [];
        for (const message of thread) {
            if (message.text) {
                messageTexts.push(`${message.sender.name}: ${message.text}`);
            }
        }

        // threadReader repeats the first message once, so here we remove it
        messageTexts.shift();
        return messageTexts.join(" // ");
    }

    private async notifyMessage(
        room: IRoom,
        read: IRead,
        user: IUser,
        message: string,
        threadId?: string
    ): Promise<void> {
        const notifier = read.getNotifier();

        const messageBuilder = notifier.getMessageBuilder();
        messageBuilder.setText(message);
        messageBuilder.setRoom(room);

        if (threadId) {
            messageBuilder.setThreadId(threadId);
        }

        return notifier.notifyUser(user, messageBuilder.getMessage());
    }
}
