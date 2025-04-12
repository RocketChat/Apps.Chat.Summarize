import {
    IPersistence,
    IPersistenceRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import {
    RocketChatAssociationModel,
    RocketChatAssociationRecord,
} from "@rocket.chat/apps-engine/definition/metadata";

interface StoredData{
    roomId?: string;
    threadId?: string;
}

export const storeData = async (
    persistence: IPersistence,
    userId: string,
    key: string,
    data: object
): Promise<void> => {
    const association = new RocketChatAssociationRecord(
        RocketChatAssociationModel.USER,
        `${userId}#${key}`
    );
    await persistence.updateByAssociation(association, data, true);
};

export const getData = async (
    persistenceRead: IPersistenceRead,
    userId: string,
    key: string,
): Promise<StoredData>  => {
    const association = new RocketChatAssociationRecord(
        RocketChatAssociationModel.USER,
        `${userId}#${key}`
    );
    const result = (await persistenceRead.readByAssociation(
        association
    ))
    return result[0] || {};
};

export const clearData = async (
    persistence: IPersistence,
    userId: string,
    key: string
): Promise<void> => {
    const association = new RocketChatAssociationRecord(
        RocketChatAssociationModel.USER,
        `${userId}#${key}`
    );
    await persistence.removeByAssociation(association);
};
