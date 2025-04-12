import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import { IUser } from "@rocket.chat/apps-engine/definition/users";
import { notifyMessage } from "./notifyMessage";
import { createAssignedTasksPrompt, createFileSummaryPrompt, createFollowUpQuestionsPrompt, createParticipantsSummaryPrompt, createSummaryPrompt, createSummaryPromptByTopics } from "../constants/prompts";
import { createTextCompletion } from "./createTextCompletion";
import { ThreadSummarizerApp } from "../ThreadSummarizerApp";
import { IHttp, IRead } from "@rocket.chat/apps-engine/definition/accessors";
import { IMessageRaw } from "@rocket.chat/apps-engine/definition/messages";

export async function handleSummaryGeneration(
    app: ThreadSummarizerApp,
    read: IRead,
    http: IHttp,
    room: IRoom,
    user: IUser,
    threadId: string | undefined,
    startDate?: Date,
    unreadCount?: number,
    usernames?: string[] | undefined,
    anyMatchedUsername?: boolean,
): Promise<void> {
    const addOns = await app.getAccessors().environmentReader.getSettings().getValueById('add-ons');
    const xAuthToken = await app.getAccessors().environmentReader.getSettings().getValueById('x-auth-token');
    const xUserId = await app.getAccessors().environmentReader.getSettings().getValueById('x-user-id');


    let messages: string;
    if(!threadId) {
    messages = await getRoomMessages(
        app,
        room,
        read,
        user,
        http,
        addOns,
        xAuthToken,
        xUserId,
        startDate,
        unreadCount,
        usernames,
        anyMatchedUsername
    );
    } else {
    messages = await getThreadMessages(
        app,
        room,
        read,
        user,
        http,
        threadId,
        addOns,
        xAuthToken,
        xUserId,
        startDate,
        unreadCount,
        usernames,
        anyMatchedUsername
    );
    }

    if (!messages?.trim()) {
    await notifyMessage(room, read, user, 'There are no messages to summarize in this channel.', threadId);
    return;
    }

    await notifyMessage(room, read, user, messages, threadId);

    const summary = await generateSummary(app, read, http, messages, threadId, room, user);
    await notifyMessage(room, read, user, summary, threadId);

    await handleAddons(app, read, http,messages, room, user, threadId, addOns);
}

async function generateSummary(
        app: ThreadSummarizerApp,
        read: IRead,
        http: IHttp,
        messages: string,
        threadId: string | undefined,
        room: IRoom,
        user: IUser,
    ) {
    const prompt = threadId ? createSummaryPrompt(messages) : createSummaryPromptByTopics(messages);
    return createTextCompletion(app, room, read, user, http, prompt, threadId);
}

async function handleAddons(
    app: ThreadSummarizerApp,
    read: IRead,
    http: IHttp,
    messages: string,
    room: IRoom,
    user: IUser,
    threadId: string | undefined,
    addOns: string[]) {
    const addonHandlers = {
        'assigned-tasks': async () => {
        const prompt = createAssignedTasksPrompt(messages);
        const result = await createTextCompletion(app, room, read, user, http, prompt, threadId);
        await notifyMessage(room, read, user, result, threadId);
        },
        'follow-up-questions': async () => {
        const prompt = createFollowUpQuestionsPrompt(messages);
        const result = await createTextCompletion(app, room, read, user, http, prompt, threadId);
        await notifyMessage(room, read, user, result, threadId);
        },
        'participants-summary': async () => {
        const prompt = createParticipantsSummaryPrompt(messages);
        const result = await createTextCompletion(app, room, read, user, http, prompt, threadId);
        await notifyMessage(room, read, user, result, threadId);
        }
    };

    for (const addon of addOns) {
        await addonHandlers[addon as keyof typeof addonHandlers]?.();
    }
    }


    export async function getFileSummary(
    app: ThreadSummarizerApp,
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
            app,
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

export async function getRoomMessages(
    app: ThreadSummarizerApp,
    room: IRoom,
    read: IRead,
    user: IUser,
    http: IHttp,
    addOns: string[],
    xAuthToken: string,
    xUserId: string,
    startDate?: Date,
    unreadCount?: number,
    usernames?: string[],
    anyMatchedUsername?: boolean
): Promise<string> {
    const messages: IMessageRaw[] = await read
        .getRoomReader()
        .getMessages(room.id, {
            limit: Math.min(unreadCount || 100, 100),
            sort: { createdAt: 'asc' },
        });

    let filteredMessages = messages;

    if (usernames) {
        filteredMessages = messages.filter((message) => {
            const isMatched = usernames.includes(message.sender.username);
            if (isMatched) {
                anyMatchedUsername = true;
            }
            return isMatched;
        });

        if (!anyMatchedUsername) {
            return `Please enter a valid command!
            You can try::
            \t 1. /chat-summary
            \t 2. /chat-summary today
            \t 3. /chat-summary week
            \t 4. /chat-summary unread
            \t 5. /chat-summary @<username> or /chat-summary @<username1> @<username2>
            \t 6. /chat-summary help
            \t 7. /chat-summary help <question>`;
        }
    }

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
            const fileSummary = await getFileSummary(
                app,
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

export async function getThreadMessages(
    app: ThreadSummarizerApp,
    room: IRoom,
    read: IRead,
    user: IUser,
    http: IHttp,
    threadId: string,
    addOns: string[],
    xAuthToken: string,
    xUserId: string,
    startDate?: Date,
    unreadCount?: number,
    usernames?: string[],
    anyMatchedUsername?: boolean
): Promise<string> {
    const threadReader = read.getThreadReader();
    const thread = await threadReader.getThreadById(threadId);
    if (!thread) {
        await notifyMessage(room, read, user, 'Thread not found');
        throw new Error('Thread not found');
    }

    let filteredMessages = thread;
    if (usernames) {
        filteredMessages = thread.filter((message) => {
            const isMatched = usernames.includes(message.sender.username);
            if (isMatched) {
                anyMatchedUsername = true;
            }
            return isMatched;
        });

        if (!anyMatchedUsername) {
            return `Please enter a valid command!
            You can try:
            \t 1. /chat-summary
            \t 2. /chat-summary today
            \t 3. /chat-summary week
            \t 4. /chat-summary unread
            \t 5. /chat-summary <username>`;
        }
    }
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
            const fileSummary = await getFileSummary(
                app,
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
    if (messageTexts.length > 0) {
        messageTexts.shift();
    }
    return messageTexts.join('\n');
}

export function getStartDate(filter: string, now: Date) {
    switch (filter) {
    case 'today': return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    case 'week': return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    default: return undefined;
    }
}

