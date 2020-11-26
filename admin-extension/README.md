# Run your app

1. Install dependencies with `npm install` or `yarn install`
2. Run `shopify serve`

# Deploy to Shopify

### With shopify connect

1. Change to other directory without existing .shopify-cli.yml file.
2. Run `shopify connect`
3. Move .env file to directory admin-extension.
4. If you already registered your extension before, you also need to do those steps:
5. Add to .env file: `EXTENSION_TITLE={EXTENSION_TITLE}`
6. Add to .env file: `EXTENSION_ID={YOUR_EXTENSION_ID}` (You can find out your extension id by opening https://partners.shopify.com/ -> Apps -> {YOUR_APP} -> Extensions -> {YOUR_PRODUCT_SUBSCRIPTION_EXTENSION} -> The id after "product_subscription/" is the extension id)

### Manually

Create .env file:

```
SHOPIFY_API_KEY={APP_API_KEY}
SHOPIFY_API_SECRET={APP_API_SECRET_KEY}
SHOP={STORE_ID}.myshopify.com
EXTENSION_TITLE=admin-extension
```

## Register and Push

`shopify register`

`shopify push`
