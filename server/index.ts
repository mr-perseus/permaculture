import 'isomorphic-fetch';
import dotenv from 'dotenv';
import Koa from 'koa';
import cors from 'koa-cors';
import logger from 'koa-logger';
import next from 'next';
import session, { Session } from 'koa-session';
import graphQLProxy, { ApiVersion } from '@shopify/koa-shopify-graphql-proxy';
import Router from 'koa-router';
import createShopifyAuth, { verifyRequest } from '@shopify/koa-shopify-auth';
import jwt_decode from 'jwt-decode';
import getSubscriptionUrl from './getSubscriptionUrl';
import configManager from './ConfigManager';

dotenv.config();

const port = parseInt(String(process.env.PORT), 10) || 8081;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const { SHOPIFY_API_SECRET, SHOPIFY_API_KEY, HOST, SHOP, SCOPES } = process.env;

if (!SHOPIFY_API_KEY || !SHOPIFY_API_SECRET || !HOST || !SHOP || !SCOPES) {
    throw new Error(
        'One of the following Environment variables are missing: SHOPIFY_API_KEY, SHOPIFY_API_SECRET, HOST, SHOP',
    );
}

app.prepare()
    // eslint-disable-next-line promise/always-return
    .then(() => {
        const server = new Koa();

        // needed for admin extension which makes calls from 'shopify' backend
        server.use(cors({ methods: ['POST'] }));
        server.use(logger());

        const router = new Router();
        server.use(session({ sameSite: 'none', secure: true }, server));
        server.keys = [SHOPIFY_API_SECRET];

        server.use(
            createShopifyAuth({
                apiKey: SHOPIFY_API_KEY,
                secret: SHOPIFY_API_SECRET,
                scopes: [SCOPES],
                async afterAuth(ctx) {
                    const { shop, accessToken } = ctx.session as Session;
                    console.log('accessToken', accessToken);
                    ctx.cookies.set('shopOrigin', shop, {
                        httpOnly: false,
                        secure: true,
                        sameSite: 'none',
                    });

                    await configManager.updateToken(shop, accessToken);

                    await getSubscriptionUrl(ctx, accessToken, shop);
                },
            }),
        );

        server.use(async (ctx, next2: () => Promise<any>) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
            const jwtFromHeader = ctx.headers['some-auth-token'];

            const shopUrl =
                ctx.cookies.get('shopOrigin') ||
                (jwtFromHeader
                    ? jwt_decode<{ dest: string }>(jwtFromHeader).dest
                    : '');

            if (shopUrl) {
                const cleanedShopUrl = shopUrl.startsWith('http')
                    ? new URL(shopUrl).pathname
                    : shopUrl;

                const token = await configManager.getToken(cleanedShopUrl);

                ctx.shop = cleanedShopUrl;
                ctx.accessToken = token;
            }

            console.log(ctx.shop);
            console.log(ctx.accessToken);

            await next2();
        });

        server.use(
            graphQLProxy({
                version: ApiVersion.Unstable,
            }),
        );

        router.get('(.*)', verifyRequest(), async (ctx) => {
            await handle(ctx.req, ctx.res);
            ctx.respond = false;
            ctx.res.statusCode = 200;
        });

        server.use(router.allowedMethods());
        server.use(router.routes());

        server.listen(port, () => {
            // eslint-disable-next-line no-console
            console.log(`> Ready on http://localhost:${port}`);
        });
    })
    .catch((e) => {
        throw e;
    });
