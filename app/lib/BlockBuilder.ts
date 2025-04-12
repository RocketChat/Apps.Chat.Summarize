import {
	LayoutBlockType,
	TextObjectType,
	InputBlock,
	DividerBlock,
} from '@rocket.chat/ui-kit';
import { IBlockBuilder } from '../ui-kit/Block/IBlockBuilder';
import { InputBlockParam } from '../ui-kit/Block/IInputBlock';

export class BlockBuilder implements IBlockBuilder {
	constructor(private readonly appId: string) {}

	public createInputBlock(param: InputBlockParam): InputBlock {
		const { text, element, blockId, hint, optional } = param;

		const inputBlock: InputBlock = {
			type: LayoutBlockType.INPUT,
			label: {
				type: TextObjectType.PLAIN_TEXT,
				text,
			},
			appId: this.appId,
			element,
			hint,
			optional,
			blockId,
		};

		return inputBlock;
	}

	public createDividerBlock(blockId?: string | undefined): DividerBlock {
		const dividerBlock: DividerBlock = {
			type: LayoutBlockType.DIVIDER,
			appId: this.appId,
			blockId,
		};

		return dividerBlock;
	}

}
