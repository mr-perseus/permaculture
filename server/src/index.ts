import 'isomorphic-fetch';
import dotenv from 'dotenv';
import Koa, { ParameterizedContext } from 'koa';
import next from 'next';
import session, { Session } from 'koa-session';
import graphQLProxy, { ApiVersion } from '@shopify/koa-shopify-graphql-proxy';
import Router from 'koa-router';
import createShopifyAuth, { verifyRequest } from '@shopify/koa-shopify-auth';
import {
    DeliveryMethod,
    receiveWebhook,
    registerWebhook,
} from '@shopify/koa-shopify-webhooks';
import getSubscriptionUrl from './getSubscriptionUrl';

dotenv.config();

const port = parseInt(String(process.env.PORT), 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev, dir: '../client' });
const handle = app.getRequestHandler();

const { SHOPIFY_API_SECRET_KEY, SHOPIFY_API_KEY, HOST } = process.env;

if (!SHOPIFY_API_KEY || !SHOPIFY_API_SECRET_KEY || !HOST) {
    throw new Error(
        'One of the following Environment variables are missing: SHOPIFY_API_KEY, SHOPIFY_API_SECRET_KEY, HOST',
    );
}

app.prepare()
    .then(() => {
        const server = new Koa();
        const router = new Router();
        server.use(session({ sameSite: 'none', secure: true }, server));
        server.keys = [SHOPIFY_API_SECRET_KEY];

        server.use(
            createShopifyAuth({
                apiKey: SHOPIFY_API_KEY,
                secret: SHOPIFY_API_SECRET_KEY,
                scopes: ['read_products', 'write_products'],
                async afterAuth(ctx) {
                    const { shop, accessToken } = ctx.session as Session;
                    ctx.cookies.set('shopOrigin', shop, {
                        httpOnly: false,
                        secure: true,
                        sameSite: 'none',
                    });
                    const registration = await registerWebhook({
                        address: `${HOST}/webhooks/products/create`,
                        topic: 'PRODUCTS_CREATE',
                        accessToken: String(accessToken),
                        shop: String(shop),
                        apiVersion: ApiVersion.July20,
                        deliveryMethod: DeliveryMethod.Http,
                    });

                    if (registration.success) {
                        console.log('Successfully registered webhook!');
                    } else {
                        console.log(
                            'Failed to register webhook',
                            registration.result,
                        );
                    }
                    await getSubscriptionUrl(ctx, accessToken, shop);
                },
            }),
        );

        const webhook = receiveWebhook({ secret: SHOPIFY_API_SECRET_KEY });

        router.post(
            '/webhooks/products/create',
            webhook,
            (ctx: ParameterizedContext) => {
                console.log('received webhook: ', ctx.state.webhook);
            },
        );

        server.use(graphQLProxy({ version: ApiVersion.July20 }));

        router.get('(.*)', verifyRequest(), async (ctx) => {
            await handle(ctx.req, ctx.res);
            ctx.respond = false;
            ctx.res.statusCode = 200;
        });

        server.use(router.allowedMethods());
        server.use(router.routes());

        server.listen(port, () => {
            console.log(`> Ready on http://localhost:${port}`);
        });
    })
    .catch(() => {
        // TODO
    });
