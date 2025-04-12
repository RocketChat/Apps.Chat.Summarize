import {
    IHttp,
    IModify,
    IPersistence,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import {
    IUIKitResponse,
    UIKitActionButtonInteractionContext,
} from "@rocket.chat/apps-engine/definition/uikit";
import { ThreadSummarizerApp } from "../ThreadSummarizerApp";
import { summarizeModal } from "../modal/summarizeModal";
import { clearData, storeData } from "../lib/dataStore";
import { ROOM_ID_KEY, THREAD_ID_KEY } from "../enum/keys";

export class ActionButtonHandler {
    public async executor(
        app: ThreadSummarizerApp,
        context: UIKitActionButtonInteractionContext,
        read: IRead,
        http: IHttp,
        persistence: IPersistence,
        modify: IModify,
    ): Promise<IUIKitResponse> {
        const { triggerId, user, room, threadId, } = context.getInteractionData();

        await clearData(persistence, user.id, THREAD_ID_KEY);
        await clearData(persistence, user.id, ROOM_ID_KEY);

        const modal = await summarizeModal(
			app,
            read,
            user,
		);
        if(user.id){
                const roomId = room.id;
            await storeData(persistence, user.id, ROOM_ID_KEY, {roomId});
            if (threadId) {
                await storeData(persistence, user.id, THREAD_ID_KEY, { threadId });
            }
            }


		if (triggerId) {
			await modify
				.getUiController()
				.openSurfaceView(modal, { triggerId: triggerId }, user);
		}


        return context.getInteractionResponder().successResponse();
    }
}
