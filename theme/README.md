# Deploy this theme to your store

-   Install Shopify Theme Kit: https://shopify.github.io/themekit/
-   Get theme id: `theme get --list -p={your_shopify_access_token} -s={store-id}.myshopify.com`
    The access token is the one you stored in the .env file in the project's root folder.
-   Create config.yml

```
development:
  password: {your_shopify_access_token}
  theme_id: "{theme_id}"
  store: {store-id}.myshopify.com
```

-   Run `theme deploy`

# Download a theme

`theme get -p={your_shopify_access_token} -s={store-id}.myshopify.com --themeid={theme_id}`
