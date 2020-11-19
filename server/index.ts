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
import getSubscriptionUrl from './getSubscriptionUrl';

dotenv.config();

const port = parseInt(String(process.env.PORT), 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const {
    SHOPIFY_API_SECRET_KEY,
    SHOPIFY_API_KEY,
    HOST,
    SHOPIFY_ACCESS_TOKEN,
} = process.env;

if (!SHOPIFY_API_KEY || !SHOPIFY_API_SECRET_KEY || !HOST) {
    throw new Error(
        'One of the following Environment variables are missing: SHOPIFY_API_KEY, SHOPIFY_API_SECRET_KEY, HOST',
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
        server.keys = [SHOPIFY_API_SECRET_KEY];

        server.use(
            createShopifyAuth({
                apiKey: SHOPIFY_API_KEY,
                secret: SHOPIFY_API_SECRET_KEY,
                scopes: ['read_products', 'write_products', 'write_themes'],
                async afterAuth(ctx) {
                    const { shop, accessToken } = ctx.session as Session;
                    ctx.cookies.set('shopOrigin', shop, {
                        httpOnly: false,
                        secure: true,
                        sameSite: 'none',
                    });

                    await getSubscriptionUrl(ctx, accessToken, shop);
                },
            }),
        );

        server.use(
            graphQLProxy({
                version: ApiVersion.Unstable,
                password: SHOPIFY_ACCESS_TOKEN,
                shop: 'https://perma-subs-test.myshopify.com',
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
