import {
	IAppAccessors,
	IConfigurationExtend,
	IHttp,
	ILogger,
    IModify,
    IPersistence,
    IRead,
} from '@rocket.chat/apps-engine/definition/accessors';
import { App } from '@rocket.chat/apps-engine/definition/App';
import { IAppInfo } from '@rocket.chat/apps-engine/definition/metadata';
import { SummarizeCommand } from './commands/SummarizeCommand';
import { settings } from './settings/settings';
import { ActionButton } from './enum/ActionButton';
import { UIActionButtonContext, IUIActionButtonDescriptor } from '@rocket.chat/apps-engine/definition/ui';
import { IUIKitResponse, UIKitActionButtonInteractionContext, UIKitBlockInteractionContext, UIKitViewCloseInteractionContext, UIKitViewSubmitInteractionContext } from '@rocket.chat/apps-engine/definition/uikit';
import { ActionButtonHandler } from './handlers/ExecuteActionButtonHandler';
import { ExecuteBlockActionHandler } from './handlers/ExecuteBlockActionHandler';
import { ExecuteViewClosedHandler } from './handlers/ExecuteViewCloseHandler';
import { ExecuteViewSubmitHandler } from './handlers/ExecuteViewSubmitHandler';


export class ThreadSummarizerApp extends App {
	constructor(info: IAppInfo, logger: ILogger, accessors: IAppAccessors) {
		super(info, logger, accessors);
	}

	public async extendConfiguration(configuration: IConfigurationExtend) {

        const summarizeMessageButton: IUIActionButtonDescriptor = {
            actionId: ActionButton.SUMMARIZE_MESSAGES_ACTION,
            labelI18n: ActionButton.SUMMARIZE_MESSAGES_LABEL,
            context: UIActionButtonContext.MESSAGE_BOX_ACTION,
        }

        configuration.ui.registerButton(summarizeMessageButton);

		await Promise.all([
			...settings.map((setting) =>
				configuration.settings.provideSetting(setting)
			),
			configuration.slashCommands.provideSlashCommand(
				new SummarizeCommand(this)
			),
		]);
	}

    public async executeActionButtonHandler(
		context: UIKitActionButtonInteractionContext,
		read: IRead,
		http: IHttp,
		persistence: IPersistence,
		modify: IModify,
	): Promise<IUIKitResponse> {
        const handler = new ActionButtonHandler().executor(
            this,
            context,
            read,
            http,
            persistence,
            modify,
        )

        return await handler
	}

    public async executeBlockActionHandler(
		context: UIKitBlockInteractionContext,
		read: IRead,
		http: IHttp,
		persistence: IPersistence,
		modify: IModify,
	): Promise<IUIKitResponse> {
        const {threadId }= context.getInteractionData();
        this.getLogger().debug(threadId, "threaid")
		const handler = new ExecuteBlockActionHandler(
			this,
			read,
			http,
			persistence,
			modify,
			context,
		);

		return await handler.handleActions(context);
	}

    public async executeViewClosedHandler(
		context: UIKitViewCloseInteractionContext,
        persistence: IPersistence,

	): Promise<IUIKitResponse> {
		const handler = new ExecuteViewClosedHandler(
			context,
            persistence
		);

		return await handler.handleActions();
	}

    public async executeViewSubmitHandler(
		context: UIKitViewSubmitInteractionContext,
		read: IRead,
		http: IHttp,
		persistence: IPersistence,
		modify: IModify,
	) {
		const handler = new ExecuteViewSubmitHandler(
			this,
			read,
			http,
			persistence,
			modify,
			context,
		);

		return await handler.handleActions(context);
	}

}
