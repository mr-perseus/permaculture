export const gidToId = (gid: string): string => {
    return gid.substr(gid.lastIndexOf('/') + 1);
};

export const idToGid = (id: string, type: string): string => {
    return `gid://shopify/${type}/${id}`;
};
