import { Context } from 'koa';
import jwt from 'jsonwebtoken';
import keyValueStore from './KeyValueStore';

type WebTokenObject = {
    dest: string;
};

const validateTokenGetShopUrl = (
    jwtFromHeader: string,
    appApiSecretKey: string,
): string => {
    try {
        const decoded: WebTokenObject = jwt.verify(
            jwtFromHeader,
            appApiSecretKey,
            {
                algorithms: ['HS256'],
            },
        ) as WebTokenObject;

        return decoded.dest;
    } catch (error) {
        console.error('JWT Validation Error', error);

        throw new Error(
            'Session invalid. Please make sure the "Permaculture" app is running and refresh this page.',
        );
    }
};

const authenticateGraphqlProxy = (appApiSecretKey: string) => {
    return async (ctx: Context, next: () => Promise<void>): Promise<void> => {
        const jwtFromHeader = (ctx.headers as {
            'auth-token'?: string;
        })['auth-token'];

        if (!jwtFromHeader) {
            // If the call comes from the app instead of the argo extension, Koa takes care of the session validation and there is no 'auth-token' header.
            await next();
            return;
        }

        const shopUrl = validateTokenGetShopUrl(jwtFromHeader, appApiSecretKey);

        if (!shopUrl || !ctx.session) {
            throw new Error('Authentication invalid.');
        }

        const cleanedShopUrl = new URL(shopUrl).host;

        ctx.session.shop = cleanedShopUrl;
        ctx.session.accessToken = await keyValueStore.getToken(cleanedShopUrl);

        await next();
    };
};

export default authenticateGraphqlProxy;
