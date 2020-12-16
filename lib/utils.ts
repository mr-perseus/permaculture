export const gidToId = (gid: string): string => {
    return gid.substr(gid.lastIndexOf('/') + 1);
};

export const idToGid = (id: string, type: string): string => {
    if (!id || !type || !id.match(/^[0-9]+$/g)) {
        throw new Error(`Id or type invalid. ID: ${id}, type: ${type}`);
    }

    return `gid://shopify/${type}/${id}`;
};
