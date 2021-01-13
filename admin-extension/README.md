# Run your app

1. Install dependencies with `yarn install`
2. Make sure you have the `HOST` environment variable set in the .env file of the root project directory (`../.env` relative to the admin extension). For default app (Heroku), remove the `HOST` environment variable there.
3. Run `shopify serve`

# Deploy to Shopify

Create a .env file in the current directory (admin-extension):

`shopify connect`

```
SHOPIFY_API_KEY={APP_API_KEY}
SHOPIFY_API_SECRET={APP_API_SECRET_KEY}
SHOP={STORE_ID}.myshopify.com
EXTENSION_TITLE={EXTENSION_TITLE}
EXTENSION_ID={YOUR_EXTENSION_ID}
```

## Register and Push

`shopify register`

`shopify push`
