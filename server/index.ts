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
import keyValueStore from './KeyValueStore';
import authenticateGraphqlProxy from './authenticateGraphqlProxy';
import getSubscriptionUrl from './getSubscriptionUrl';

dotenv.config();

const port = parseInt(String(process.env.PORT), 10) || 8081;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const { SHOPIFY_API_SECRET, SHOPIFY_API_KEY, HOST } = process.env;

if (!SHOPIFY_API_KEY || !SHOPIFY_API_SECRET || !HOST) {
    throw new Error(
        'One of the following Environment variables are missing: SHOPIFY_API_KEY, SHOPIFY_API_SECRET, HOST',
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
                scopes: [
                    'write_products',
                    'write_customers',
                    'write_draft_orders',
                    'write_own_subscription_contracts',
                    'write_discounts',
                    'write_themes',
                ],
                async afterAuth(ctx) {
                    const { shop, accessToken } = ctx.session as Session;
                    console.log('accessToken', accessToken);

                    await keyValueStore.updateToken(shop, accessToken);

                    const returnUrl = `${HOST}?shop=${String(shop)}`;
                    const subscriptionUrl = await getSubscriptionUrl(
                        accessToken,
                        shop,
                        returnUrl,
                    );

                    ctx.redirect(subscriptionUrl);
                },
            }),
        );

        server.use(authenticateGraphqlProxy(SHOPIFY_API_SECRET));

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
