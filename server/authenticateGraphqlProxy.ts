import { Context } from 'koa';
import jwt from 'jsonwebtoken';
import keyValueStore from './KeyValueStore';

interface WebTokenObject {
    dest: string;
}

const authenticateGraphqlProxy = (appApiSecretKey: string) => {
    return async (ctx: Context, next: () => Promise<void>): Promise<void> => {
        if (ctx.path !== '/graphql' || ctx.method !== 'POST') {
            await next();
            return;
        }

        let shopUrl: string | undefined;

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
        const jwtFromHeader = ctx.headers['auth-token'];

        if (jwtFromHeader) {
            try {
                const decoded: WebTokenObject = jwt.verify(
                    jwtFromHeader,
                    appApiSecretKey,
                    {
                        algorithms: ['HS256'],
                    },
                ) as WebTokenObject;

                shopUrl = decoded.dest;
            } catch (error) {
                console.error('JWT Validation Error', error);

                throw new Error(
                    'Session invalid. Please make sure the "Permaculture" app is running and refresh this page.',
                );
            }
        }

        const shopOriginCookie = ctx.cookies.get('shopOrigin');
        if (shopOriginCookie) {
            shopUrl = ctx.cookies.get('shopOrigin');
        }

        if (!shopUrl || !ctx.session) {
            throw new Error('Authentication invalid.');
        }

        const cleanedShopUrl = shopUrl.startsWith('http')
            ? new URL(shopUrl).host
            : shopUrl;

        ctx.session.shop = cleanedShopUrl;
        ctx.session.accessToken = await keyValueStore.getToken(cleanedShopUrl);

        await next();
    };
};

export default authenticateGraphqlProxy;
