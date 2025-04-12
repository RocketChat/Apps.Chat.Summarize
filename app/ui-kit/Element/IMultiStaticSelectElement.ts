import { MultiStaticSelectElement, TextObject} from "@rocket.chat/ui-kit";

export type MultiStaticSelectElementParam = Pick<
    MultiStaticSelectElement,
    | "options"
    | "optionGroups"
    | "initialOption"
    | "initialValue"
    | "dispatchActionConfig"
> & { placeholder: string};

export type MultiStaticSelectOptionsParam = Array<{
    text: TextObject;
    value: string;
    description?: string;
    url?: string;
}>;
