import { ButtonParam } from '../ui-kit/Element/IButtonElement';
import {
	IElementBuilder,
	ElementInteractionParam,
} from '../ui-kit/Element/IElementBuilder';
import {
	ButtonElement,
	BlockElementType,
	TextObjectType,
	Option,
	StaticSelectElement,
    MultiStaticSelectElement
} from '@rocket.chat/ui-kit';
import {
	StaticSelectElementParam,
	StaticSelectOptionsParam,
} from '../ui-kit/Element/IStaticSelectElement';
import { MultiStaticSelectElementParam, MultiStaticSelectOptionsParam } from '../ui-kit/Element/IMultiStaticSelectElement';

export class ElementBuilder implements IElementBuilder {
	constructor(private readonly appId: string) {}
	public addButton(
		param: ButtonParam,
		interaction: ElementInteractionParam,
	): ButtonElement {
		const { text, url, value, style } = param;
		const { blockId, actionId } = interaction;
		const button: ButtonElement = {
			type: BlockElementType.BUTTON,
			text: {
				type: TextObjectType.PLAIN_TEXT,
				text,
			},
			appId: this.appId,
			blockId,
			actionId,
			url,
			value,
			style,
		};
		return button;
	}

	public addDropDown(
		param: StaticSelectElementParam,
		interaction: ElementInteractionParam,
	): StaticSelectElement {
		const {
			placeholder,
			options,
			optionGroups,
			initialOption,
			initialValue,
			dispatchActionConfig,
		} = param;
		const { blockId, actionId } = interaction;
		const dropDown: StaticSelectElement = {
			type: BlockElementType.STATIC_SELECT,
			placeholder: {
				type: TextObjectType.PLAIN_TEXT,
				text: placeholder,
			},
			options,
			optionGroups,
			initialOption,
			initialValue,
			appId: this.appId,
			blockId,
			actionId,
			dispatchActionConfig,
		};
		return dropDown;
	}

    public addMultiStaticSelect(
		param: MultiStaticSelectElementParam,
		interaction: ElementInteractionParam,
	): MultiStaticSelectElement {
		const {
			placeholder,
			options,
			optionGroups,
			dispatchActionConfig,
		} = param;
		const { blockId, actionId } = interaction;
		const dropDown: MultiStaticSelectElement = {
			type: BlockElementType.MULTI_STATIC_SELECT,
			placeholder: {
				type: TextObjectType.PLAIN_TEXT,
				text: placeholder,
			},
			options,
			optionGroups,
			appId: this.appId,
			blockId,
			actionId,
			dispatchActionConfig,
		};
		return dropDown;
	}


	public createDropDownOptions(
		param: StaticSelectOptionsParam,
	): Array<Option> {
		const options: Array<Option> = param.map((option) => {
			const { text, value, description, url } = option;
			const optionObject: Option = {
				text: {
					type: TextObjectType.PLAIN_TEXT,
					text,
				},
				value,
				...(description
					? {
							description: {
								type: TextObjectType.PLAIN_TEXT,
								text: description,
							},
                    }
					: undefined),
				url,
			};
			return optionObject;
		});
		return options;
	}

    public createMultiSelectOptions(
		param: MultiStaticSelectOptionsParam,
	): Array<Option> {
		const options: Array<Option> = param.map((option) => {
			const { text, value, description, url } = option;
			const optionObject: Option = {
				text: {
					type: TextObjectType.PLAIN_TEXT,
					text: text.text,
				},
				value,
				...(description
					? {
							description: {
								type: TextObjectType.PLAIN_TEXT,
								text: description,
							},
                    }
					: undefined),
				url,
			};
			return optionObject;
		});
		return options;
	}

}
