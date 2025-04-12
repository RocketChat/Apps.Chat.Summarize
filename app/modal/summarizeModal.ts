
import {
	IRead,
	IUIKitSurfaceViewParam,
} from '@rocket.chat/apps-engine/definition/accessors';

import {
	ButtonStyle,
	UIKitSurfaceType,
} from '@rocket.chat/apps-engine/definition/uikit';
import {  DividerBlock, InputBlock, SectionBlock, TextObjectType } from '@rocket.chat/ui-kit';
import { ElementBuilder } from '../lib/ElementBuilder';
import { BlockBuilder } from '../lib/BlockBuilder';
import { ThreadSummarizerApp } from '../ThreadSummarizerApp';
import { SummarizeModalEnum } from '../enum/modal/summarizeModal';
import { MultiStaticSelectOptionsParam } from '../ui-kit/Element/IMultiStaticSelectElement';
import { getData } from '../lib/dataStore';
import { ROOM_ID_KEY } from '../enum/keys';
import { IUser } from '@rocket.chat/apps-engine/definition/users';


export async function summarizeModal(
	app: ThreadSummarizerApp,
    read: IRead,
    user: IUser,
    filterValue?:string
): Promise<IUIKitSurfaceViewParam> {
	const elementBuilder: ElementBuilder = new ElementBuilder(app.getID());
	const blockBuilder: BlockBuilder = new BlockBuilder(app.getID());

    const { roomId } = await getData(
                read.getPersistenceReader(),
                user.id,
                ROOM_ID_KEY,
            );

	const blocks: (SectionBlock | InputBlock | DividerBlock)[] = [];

    const options = [
        {
            text: "All messages",
            value: "all"
        },
        {
            text: "Messages from today",
            value: "today"
        },
        {
            text: "Messages from the past week",
            value: "week"
        },
        {
            text: "Recent Unread Messages",
            value: "unread"
        },
        {
            text: "Messages from a specific user or multiple users",
            value: "users"
        },

    ]

	const summarizeDropDownOption =
		elementBuilder.createDropDownOptions(options);

    const summarizeDropDown = elementBuilder.addDropDown(
		{
			placeholder: "Choose summarize preference",
			options: summarizeDropDownOption,
			initialOption: summarizeDropDownOption.find(
				(option) => option.value === filterValue ? filterValue : "all",
			),
			dispatchActionConfig: ['on_item_selected'],
		},
		{
			blockId: SummarizeModalEnum.FILTER_SUMMARIES_DROPDOWN_BLOCK_ID,
			actionId: SummarizeModalEnum.FILTER_SUMMARIES_DROPDOWN_ACTION_ID,
		},
	);

	blocks.push(
		blockBuilder.createInputBlock({
			text: 'Summarize',
			element: summarizeDropDown,
			optional: false,
            blockId: SummarizeModalEnum.FILTER_SUMMARIES_DROPDOWN_BLOCK_ID
		},
    ),
	);

    if(filterValue === "users") {
        const userOptions: MultiStaticSelectOptionsParam = [];
        try {
        if (user.id && roomId) {
            const members = await read.getRoomReader().getMembers(roomId);
            for (const member of members) {
                if (member.id) {
                    userOptions.push({
                        text: {
                            type: TextObjectType.MRKDWN,
                            text: `${member.name} - @${member.username}`,
                        },
                        value: `${member.username}`,
                    });
                }
            }
            userOptions.sort((a, b) => {
                return a.text.text.toUpperCase() < b.text.text.toUpperCase()
                    ? -1
                    : 1;
            });
        }
        } catch (error) {
            app.getLogger().log(error)
        }

    const userMultiSelectOptions = elementBuilder.createMultiSelectOptions(userOptions);

    const userSelectElement = elementBuilder.addMultiStaticSelect(
		{
			placeholder: "Choose summarize preference",
			options: userMultiSelectOptions,
			dispatchActionConfig: ['on_character_entered'],
		},
		{
			blockId: SummarizeModalEnum.USER_LISTS_BLOCK_ID,
			actionId: SummarizeModalEnum.USER_LISTS_ACTION_ID,
		},
	);

    blocks.push(blockBuilder.createDividerBlock());

    blocks.push(
		blockBuilder.createInputBlock({
			text: 'Select Users',
			element: userSelectElement,
			optional: false,
		}),
	);

    }

    const submit = elementBuilder.addButton(
        { text: 'Summarize', style: ButtonStyle.PRIMARY },
					{
						actionId: SummarizeModalEnum.SUBMIT_ACTION_ID,
						blockId: SummarizeModalEnum.SUBMIT_BLOCK_ID,
					}
    )

	const close = elementBuilder.addButton(
		{ text: "Close", style: ButtonStyle.DANGER },
		{
			actionId: SummarizeModalEnum.CLOSE_ACTION_ID,
			blockId: SummarizeModalEnum.CLOSE_BLOCK_ID,
		},
	);
	return {
		id: SummarizeModalEnum.VIEW_ID,
		type: UIKitSurfaceType.MODAL,
		title: {
			type: TextObjectType.MRKDWN,
			text: "Summarize messages",
		},
		blocks,
		close,
		submit
	};
}
