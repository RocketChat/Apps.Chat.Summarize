import { IHttp, IHttpResponse, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { IRoom } from '@rocket.chat/apps-engine/definition/rooms';
import { IUser } from '@rocket.chat/apps-engine/definition/users';
import { notifyMessage } from './notifyMessage';
import { App } from '@rocket.chat/apps-engine/definition/App';
import { SettingEnum } from '../settings/settings';

interface OpenAIBody{
    model: string;
    messages: { role: string; content: string }[];
    temperature: number;
}
interface GeminiBody{
    model: string;
    contents: { role: string; parts: { text: string }[] }[];
}


export async function createTextCompletion(
	app: App,
	room: IRoom,
	read: IRead,
	user: IUser,
	http: IHttp,
	prompt: string,
	threadId?: string
): Promise<string> {

    let model: string;
    const aiProvider = await app
    .getAccessors()
    .environmentReader.getSettings()
    .getValueById(SettingEnum.AI_PROVIDER_OPTION_ID);

    if(aiProvider === SettingEnum.ROCKETCHAT_INTERNAL_MODEL){
        model = await app
        .getAccessors()
        .environmentReader.getSettings()
        .getValueById(SettingEnum.MODEL_SELECTION)
    }
    else {
        model = await app
        .getAccessors()
        .environmentReader.getSettings()
        .getValueById(SettingEnum.AI_MODEL_NAME)
    }


	const body = {
		model,
		messages: [
			{
				role: 'system',
				content: prompt,
			},
		],
		temperature: 0,
	};

	const response = await handleResponse(body, app, http)

	if (!response) {
		await notifyMessage(
			room,
			read,
			user,
			'Something is wrong with AI. Please try again later',
			threadId
		);
		throw new Error('Something is wrong with AI. Please try again later');
	}

    return response
}

async function handleResponse(
    body: OpenAIBody,
    app: App,
    http: IHttp
): Promise<string> {

    const aiProvider = await app
    .getAccessors()
    .environmentReader.getSettings()
    .getValueById(SettingEnum.AI_PROVIDER_OPTION_ID);

    const apiKey = await app
    .getAccessors()
    .environmentReader.getSettings()
    .getValueById(SettingEnum.AI_API_KEY);

    const apiUrl = await app
    .getAccessors()
    .environmentReader.getSettings()
    .getValueById(SettingEnum.AI_MODEL_API_URL);


    const safeUrl = cleanApiUrl(apiUrl)

    switch (aiProvider) {
        case SettingEnum.ROCKETCHAT_INTERNAL_MODEL:
            return await handleInternalLLM(body, app, http);

        case SettingEnum.SELF_HOSTED_MODEL:
            return await handleSelfHostedModel(body, app, http, safeUrl);

        case SettingEnum.OPEN_AI:
            return await handleOpenAI(body, app, http, safeUrl, apiKey);

        case SettingEnum.GEMINI:
            return await handleGemini(body, app, http, apiKey);

        default: {
            const errorMsg = 'Error: AI provider is not configured correctly.';
            app.getLogger().log(errorMsg);
            return errorMsg;
        }
    }

}


async function handleInternalLLM(
    body: object,
    app : App,
    http: IHttp,
): Promise<string> {
    try {

        const modelname = await app
		.getAccessors()
		.environmentReader.getSettings()
		.getValueById(SettingEnum.MODEL_SELECTION);

        const response: IHttpResponse = await http.post(
            `http://${modelname}/v1/chat/completions`,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
                content: JSON.stringify(body),
            });

            if (!response || !response.data) {
                app.getLogger().log('No response data received from AI.');
                return "Something went wrong. Please try again later.";
            }

            const { choices } = response.data;
            return choices[0].message.content;

    } catch (error) {
            app
            .getLogger()
            .log(`Error in handleInternalLLM: ${error.message}`);
        return "Something went wrong. Please try again later.";
}
}


async function handleSelfHostedModel(
    body: object,
    app : App,
    http: IHttp,
    apiUrl: string,
): Promise<string> {
    try {

        if (!apiUrl) {
            app.getLogger().log('Self Hosted Model address not set.');
                return "Your Workspace AI is not set up properly. Please contact your administrator"
            }


        const response: IHttpResponse = await http.post(
            `${apiUrl}/api/chat`,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
                content: JSON.stringify({
                    ...body,
                    stream: false
                }),
            },
        );

        if (!response || !response.data) {
            app.getLogger().log('No response data received from AI.');
            return "Something went wrong. Please try again later.";
        }

        const {message}= response.data
        return message.content ;
    } catch (error) {
            app
            .getLogger()
            .log(`Error in handleSelfHostedModel: ${error.message}`);
        return "Something went wrong. Please try again later.";
}
}

async function handleOpenAI(
    body: object,
    app: App,
    http: IHttp,
    apiUrl: string,
    apiKey: string,
): Promise<string> {
    try {

        if (!apiKey || !apiUrl) {
            app.getLogger().log('OpenAI settings not set properly.');
            return "AI is not configured. Please contact your administrator to use this feature."
        }

        const response: IHttpResponse = await http.post(
            `${apiUrl}/v1/chat/completions`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${apiKey}`,
                },
                content: JSON.stringify(body),
            },
        );

        if (!response || !response.data) {
            app.getLogger().log('No response data received from AI.');
            return "Something went wrong. Please try again later.";
        }

        const { choices } = response.data;
        return choices[0].message.content;
    } catch (error) {
        app.getLogger().log(`Error in handleOpenAI: ${error.message}`);
        return "Something went wrong. Please try again later.";
    }
}

async function handleGemini(
    body: OpenAIBody,
    app: App,
    http: IHttp,
    apiKey: string
): Promise<string> {
    try {
        if (!apiKey) {
            app.getLogger().log('Gemini API key is missing.');
            return "AI is not configured. Please contact your administrator to use this feature.";
        }

        const geminiBody = convertToGeminiFormat(body);
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${geminiBody.model}:generateContent?key=${apiKey}`;
        const response: IHttpResponse = await http.post(apiUrl, {
            headers: {
                'Content-Type': 'application/json',
            },
            content: JSON.stringify(geminiBody),
        });

        if (!response || !response.data) {
            app.getLogger().log('No response data received from Gemini.');
            return "Something went wrong. Please try again later.";
        }

        const data = response.data;
        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        app.getLogger().log(`Error in handleGemini: ${error.message}`);
        return "Something went wrong. Please try again later.";
    }
}

function cleanApiUrl(apiUrl: string): string {
    return apiUrl.replace(/(\/v1\/chat\/completions|\/api\/chat|\/chat\/completions|\/v1\/chat|\/api\/generate)\/?$/, '');
}

function convertToGeminiFormat(openAIBody: OpenAIBody): GeminiBody {
    const { model, messages } = openAIBody;

    const contents = messages.map(({ role, content }) => ({
        role: role === "system" ? "user" : role,
        parts: [{ text: content }]
    }));

    return { model, contents};
}
