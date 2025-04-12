import {
	IUIKitResponse,
	UIKitBlockInteractionContext,
} from '@rocket.chat/apps-engine/definition/uikit';
import {
	IHttp,
	IModify,
	IPersistence,
	IRead,
} from '@rocket.chat/apps-engine/definition/accessors';


import { SummarizeModalEnum } from '../enum/modal/summarizeModal';
import { ThreadSummarizerApp } from '../ThreadSummarizerApp';
import { summarizeModal } from '../modal/summarizeModal';


export class ExecuteBlockActionHandler {
	private context: UIKitBlockInteractionContext;
	constructor(
		protected readonly app: ThreadSummarizerApp,
		protected readonly read: IRead,
		protected readonly http: IHttp,
		protected readonly persistence: IPersistence,
		protected readonly modify: IModify,
		context: UIKitBlockInteractionContext,
	) {
		this.context = context;
	}

	public async handleActions(context: UIKitBlockInteractionContext): Promise<IUIKitResponse> {
		const {
			actionId,
			user,
			value,
		} = context.getInteractionData();



		if(actionId === SummarizeModalEnum.FILTER_SUMMARIES_DROPDOWN_ACTION_ID) {
                const updatedModal = await summarizeModal(
                    this.app,
                    this.read,
                    user,
                    value
                )

                return this.context
                .getInteractionResponder()
                .updateModalViewResponse(updatedModal)
        }
		return this.context.getInteractionResponder().successResponse();
	}
}
