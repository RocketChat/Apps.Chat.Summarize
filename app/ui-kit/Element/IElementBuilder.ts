import {
	ButtonElement,
} from '@rocket.chat/ui-kit';
import { ButtonParam } from './IButtonElement';

export interface IElementBuilder {
	addButton(
		param: ButtonParam,
		interaction: ElementInteractionParam,
	): ButtonElement;
}

export type ElementInteractionParam = { blockId: string; actionId: string };
