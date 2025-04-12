import {
	InputBlock,
	DividerBlock,
} from '@rocket.chat/ui-kit';
import { InputBlockParam } from './IInputBlock';

export interface IBlockBuilder {
	createInputBlock(param: InputBlockParam): InputBlock;
	createDividerBlock(blockId?: string): DividerBlock;
}
