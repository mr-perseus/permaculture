# shopify-demo-app-node-react

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE.md)

This repository contains the completed app for the [Build a Shopify app with Node and React](https://developers.shopify.com/tutorials/build-a-shopify-app-with-node-and-react) tutorial.

## Using demo app

If you plan to use this completed app, then make sure that you first complete these setup instructions:

1. [Install the latest stable version of Node.js.](https://developers.shopify.com/tutorials/build-a-shopify-app-with-node-and-react/set-up-your-app#install-the-latest-stable-version)
2. Install npm packages: run `yarn`
3. Start your app: `shopify serve`
4. Deploy your app on a store (Login here: https://partners.shopify.com/ go to "Apps" -> {YOUR_APP} -> "Test your app" -> "Select store")

Note: You need to allow third party cookies on myshopify.com

## Download GraphQL schema

1. Extract shopify access token (e.g. console.log in running server during oauth process)\*
2. Add to `.env` file: `SHOPIFY_ACCESS_TOKEN='{your_shopify_access_token}'`
   The access token is valid for one app and one shop
3. Use IntelliJ GraphQL JS plugin to download the schema\*\*

\* Contrary to the documentation, creating a private app to access the admin API with basic authentication doesn't work,
therefore it is necessary to rely upon the OAuth authentication process  
\*\* There are other options instead of using the IntelliJ plugin. One example:

```
npx graphql-js-schema-fetch --url 'https://{store-id}.myshopify.com/admin/api/2020-10/graphql.json' --header 'X-Shopify-Access-Token: {access-token}' > shopify-schema.json
```
