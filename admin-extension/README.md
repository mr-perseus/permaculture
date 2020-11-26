# Run your app

1. Install dependencies with `npm install` or `yarn install`
2. Run `shopify serve`

# Deploy to Shopify

### With shopify connect

1. Change to other directory without existing .shopify-cli.yml file.
2. Run `shopify connect`
3. Move .env file to directory admin-extension.
4. Add to .env file: `EXTENSION_TITLE=admin-extension`

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
