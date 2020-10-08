import { Context } from 'koa';

const getSubscriptionUrl = async (
    ctx: Context,
    accessToken: string,
    shop: string,
): Promise<void> => {
    const query = JSON.stringify({
        query: `mutation {
      appSubscriptionCreate(
          name: "Super Duper Plan"
          returnUrl: "${String(process.env.HOST)}"
          test: true
          lineItems: [
          {
            plan: {
              appUsagePricingDetails: {
                  cappedAmount: { amount: 10, currencyCode: USD }
                  terms: "$1 for 1000 emails"
              }
            }
          }
          {
            plan: {
              appRecurringPricingDetails: {
                  price: { amount: 10, currencyCode: USD }
              }
            }
          }
          ]
        ) {
            userErrors {
              field
              message
            }
            confirmationUrl
            appSubscription {
              id
            }
        }
    }`,
    });

    const response = await fetch(
        `https://${shop}/admin/api/2019-07/graphql.json`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Access-Token': accessToken,
            },
            body: query,
        },
    );

    const responseJson = (await response.json()) as {
        data: { appSubscriptionCreate: { confirmationUrl: string } };
    };
    const { confirmationUrl } = responseJson.data.appSubscriptionCreate;
    return ctx.redirect(confirmationUrl);
};

export default getSubscriptionUrl;
