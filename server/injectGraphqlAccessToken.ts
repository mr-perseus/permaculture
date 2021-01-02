import { Context } from 'koa';
import jwt_decode from 'jwt-decode';
import keyValueStore from './KeyValueStore';

const injectGraphqlAccessToken = () => {
    return async (ctx: Context, next: () => Promise<void>): Promise<void> => {
        if (ctx.originalUrl === '/graphql') {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
            const jwtFromHeader = ctx.headers['auth-token'];

            const shopUrl =
                ctx.cookies.get('shopOrigin') ||
                (jwtFromHeader
                    ? jwt_decode<{ dest: string }>(jwtFromHeader).dest
                    : '');

            const contextSession = ctx.session;

            if (!contextSession || !shopUrl) {
                throw new Error('Authentication invalid.');
            }

            const cleanedShopUrl = shopUrl.startsWith('http')
                ? new URL(shopUrl).host
                : shopUrl;

            const token = await keyValueStore.getToken(cleanedShopUrl);

            contextSession.shop = cleanedShopUrl;
            contextSession.accessToken = token;
        }

        await next();
    };
};

export default injectGraphqlAccessToken;
