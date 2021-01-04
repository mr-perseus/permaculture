import { Context } from 'koa';
import jwt from 'jsonwebtoken';
import graphQLProxy, { ApiVersion } from '@shopify/koa-shopify-graphql-proxy';
import keyValueStore from './KeyValueStore';

interface WebTokenObject {
    dest: string;
}

const validatedGraphqlProxy = (appApiSecretKey: string) => {
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
            // TODO Is cookie already validated by KOA? Or just use https://shopify.dev/tutorials/authenticate-your-app-using-session-tokens instead?
            shopUrl = ctx.cookies.get('shopOrigin');
        }

        if (!shopUrl) {
            throw new Error('Authentication invalid.');
        }

        const shop = shopUrl.startsWith('http')
            ? new URL(shopUrl).host
            : shopUrl;

        const password = await keyValueStore.getToken(shop);

        await graphQLProxy({
            version: ApiVersion.Unstable,
            password,
            shop,
        })(ctx, next);
    };
};

export default validatedGraphqlProxy;
