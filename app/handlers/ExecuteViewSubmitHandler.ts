import {
	IUIKitResponse,
	UIKitViewSubmitInteractionContext,
} from '@rocket.chat/apps-engine/definition/uikit';
import {
	IHttp,
	IModify,
	IPersistence,
	IRead,
} from '@rocket.chat/apps-engine/definition/accessors';
import { ThreadSummarizerApp } from '../ThreadSummarizerApp';
import { SummarizeModalEnum } from '../enum/modal/summarizeModal';
import { IRoom } from '@rocket.chat/apps-engine/definition/rooms';
import { ROOM_ID_KEY, THREAD_ID_KEY } from '../enum/keys';
import { getData } from '../lib/dataStore';
import {getStartDate, handleSummaryGeneration} from '../helpers/summarizeHelper';

export class ExecuteViewSubmitHandler {
	private context: UIKitViewSubmitInteractionContext;

	constructor(
		protected readonly app: ThreadSummarizerApp,
		protected readonly read: IRead,
		protected readonly http: IHttp,
		protected readonly persistence: IPersistence,
		protected readonly modify: IModify,
		context: UIKitViewSubmitInteractionContext,
	) {
		this.context = context;
	}

	public async handleActions(context: UIKitViewSubmitInteractionContext): Promise<IUIKitResponse> {
		const { view, user} = context.getInteractionData();
        const{ roomId } = await getData(
            this.read.getPersistenceReader(),
            user.id,
            ROOM_ID_KEY,
        );

        const { threadId } = await getData(
            this.read.getPersistenceReader(),
            user.id,
            THREAD_ID_KEY,
        )

        if (!roomId) return this.context.getInteractionResponder().successResponse();

        const room = (await this.read.getRoomReader().getById(roomId)) as IRoom;
        const viewId = view.id.split('---')[0].trim();

        if (viewId !== SummarizeModalEnum.VIEW_ID) return this.context.getInteractionResponder().successResponse();

        const filter = view.state?.[SummarizeModalEnum.FILTER_SUMMARIES_DROPDOWN_BLOCK_ID]?.[SummarizeModalEnum.FILTER_SUMMARIES_DROPDOWN_ACTION_ID];
        const now = new Date();

        const anyMatchedUsername = false;
        const startDate = getStartDate(filter, now);
        const unreadCount = filter === 'unread' ? await this.read.getUserReader().getUserUnreadMessageCount(user.id) : undefined;
        const usernames: string[] | undefined = filter === 'users' ? view.state?.[SummarizeModalEnum.USER_LISTS_BLOCK_ID]?.[SummarizeModalEnum.USER_LISTS_ACTION_ID] : undefined;

    await handleSummaryGeneration(this.app, this.read, this.http, room, user, threadId, startDate, unreadCount,usernames, anyMatchedUsername);

        return this.context.getInteractionResponder().successResponse();
    }

}
