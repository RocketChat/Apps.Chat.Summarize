import {
	IUIKitResponse,
	UIKitViewCloseInteractionContext,
} from '@rocket.chat/apps-engine/definition/uikit';

import { IPersistence } from '@rocket.chat/apps-engine/definition/accessors';

export class ExecuteViewClosedHandler {
	private context: UIKitViewCloseInteractionContext;
    private persistence: IPersistence;
	constructor(
		context: UIKitViewCloseInteractionContext,
        persistence: IPersistence
	) {
		this.context = context;
        this.persistence = persistence
	}

	public async handleActions(): Promise<IUIKitResponse> {

        return this.context.getInteractionResponder().successResponse();

	}
}
