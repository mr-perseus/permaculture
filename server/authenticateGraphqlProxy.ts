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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
        const jwtFromHeader = ctx.headers['auth-token'];

        if (ctx.path === '/graphql' && ctx.method === 'POST' && jwtFromHeader) {
            const shopUrl = validateTokenGetShopUrl(
                jwtFromHeader,
                appApiSecretKey,
            );

            if (!shopUrl || !ctx.session) {
                throw new Error('Authentication invalid.');
            }

            const cleanedShopUrl = new URL(shopUrl).host;

            ctx.session.shop = cleanedShopUrl;
            ctx.session.accessToken = await keyValueStore.getToken(
                cleanedShopUrl,
            );
        }

        await next();
    };
};

export default authenticateGraphqlProxy;
