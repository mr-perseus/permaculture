# Installation guide

## Sign up for a new store

To create a new fresh store, you can sign up on Shopify and create one for free:

1. Sign up for a Shopify development account: https://developers.shopify.com/
2. Create an app:
    1. On your partner organization screen, go to "Apps": partners.shopify.com/<YOUR_ID>/apps
    2. Click "Create App"
    3. Choose "Custom App"
3. Create a store: https://help.shopify.com/en/partners/dashboard/managing-stores/development-stores#create-a-development-store-for-testing-apps-or-themes

## Install required tools

To run the app, you need to install Node, Yarn, and the Shopify CLI

### Install Node.js

You can install Node.js via NVM or other methods: https://nodejs.org/en/download/

```
# macOS / Ubuntu (NVM)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.37.2/install.sh | bash
nvm install --lts
# Windows (Chocolatey)
choco install nodejs-lts
```

### Install Yarn

You can install Yarn via your package manager or download it here: https://classic.yarnpkg.com/en/docs/install

```
# Ubuntu
curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
sudo apt update && sudo apt install --no-install-recommends yarn
# macOS (Homebrew)
brew install yarn
# macOS (MacPorts)
sudo port install yarn
# Windows (Chocolatey)
choco install yarn
```

### Install Shopify CLI

To install the Shopify CLI, please follow these instructions: https://shopify.github.io/shopify-app-cli/getting-started/install/

## Install and run the app

1. Install node dependencies: run `yarn install`
2. Start your app: `shopify serve`. (Optional: If you wish to use a custom ngrok url, use `shopify serve --host=https://<NGROK_SUBDOMAIN>.ngrok.io` instead. I.e. `shopify serve --host=https://permaculture1.eu.ngrok.io`)
    1. Click the link to log in with the account you created above.
    2. Choose an App name.
    3. Choose "Custom: An app custom built for a single client."
    4. If you are prompted with "Do you want to update your application url?", choose "yes".
3. Install the app on your store:
    1. On your partner organization screen, go to "Apps": partners.shopify.com/<YOUR_ID>/apps
    2. Click on your app.
    3. Click on "App setup".
    4. In "Subscriptions" -> "Access Subscriptions APIs", click on "Request access".
    5. Wait until Shopify granted you access. This may take up to seven business days.
    6. Go back to your app's overview page. In "Test your app" click "Select store"
    7. Choose your newly created store.
    8. The app is now running at <YOUR_STORE_NAME>.myshopify.com/admin/apps

Note: You need to allow third party cookies on the page <YOUR_STORE_NAME>.myshopify.com to ngrok.io

### Manually connect to your app / store

If you already created / installed the app on a store, you can alternatively skip steps 2 and 3 above and manipulate the .env file directly.

You can copy the API keys from your app's setup screen. You can omit The HOST variable as it is also set automatically when you start it.

```
SHOPIFY_API_KEY=<YOUR_APP_API_KEY>
SHOPIFY_API_SECRET=<YOUR_APP_API_SECRET_KEY>
SHOP=<YOUR_STORE_NAME>.myshopify.com
HOST=https://<NGROK_ID>.ngrok.io
```

Then run `shopify serve`.

## Install and run the Admin extension

1. Install node dependencies in the admin-extension directory: `cd admin-extension && yarn install`
2. Make sure you have the `HOST` environment variable set in the .env file of the root project directory (`../.env` relative to admin-extension). For default app (Heroku), remove the `HOST` environment variable there.
3. Run `shopify serve` to run it locally.

### Deploy the Admin extension as a new extension

If you haven't deployed this extension yet, you can deploy it with the following commands:

1. Register the extension: `shopify register --api-key=<YOUR_APP_API_KEY>`
2. Push the extension: `shoify push`

### Deploy the Admin extension as an existing extension

If you have deployed this extension already, you need to manually change the `.env` file:

```
SHOPIFY_API_KEY=<YOUR_APP_API_KEY>
SHOPIFY_API_SECRET=<YOUR_APP_API_SECRET_KEY>
SHOP=<YOUR_STORE_NAME>.myshopify.com
EXTENSION_TITLE=<EXTENSION_TITLE>
EXTENSION_ID=<YOUR_EXTENSION_ID>
```

The extension ID is visible in the extension's url: partners.shopify.com/<PARTNER_ID>/apps/<APP_ID>/extensions/product_subscription/<EXTENSION_ID>/settings

Push the extension: run `shopify push`

You can now add Subscriptions to a product on the product's edit screen: <YOUR_STORE>.myshopify.com/admin/products/

## Add subscription to theme

In order to enable subscriptions in the checkout process for customers, you need to add the subscriptions to the theme.

Note: You need to enable Shopify payments so the subscriptions appear in the theme first. Shopify payments is currently not available in a Swiss store, but it is available in most other stores (i.e. Germany).

1. Edit your theme like described in this guide: https://help.shopify.com/en/manual/online-store/os/using-themes/change-the-layout/theme-settings
2. Add the following code snipped to your product template as described here: https://shopify.dev/tutorials/customize-theme-showing-selling-plan-groups-and-selling-plans

```
{% for group in product.selling_plan_groups %}
<fieldset>
  <legend>{{ group.name}}</legend>
  {% for selling_plan in group.selling_plans %}
    <input type="radio" name="selling_plan" value="{{ selling_plan.id }}">
    {{ selling_plan.name }}
  {% endfor %}
</fieldset>
{% endfor %}
```

# Download GraphQL schema

If you want to download the GraphQL schema from your store to add intellisense to your GraphQL queries, please do the following steps.

1. Extract shopify access token (e.g. console.log in running server during oauth process)\*
2. Use IntelliJ GraphQL JS plugin to download the schema\*\*

\* Contrary to the documentation, creating a private app to access the admin API with basic authentication doesn't work,
therefore it is necessary to rely upon the OAuth authentication process  
\*\* There are other options instead of using the IntelliJ plugin. One example:

```
npx graphql-js-schema-fetch --url 'https://{store-id}.myshopify.com/admin/api/2020-10/graphql.json' --header 'X-Shopify-Access-Token: {access-token}' > shopify-schema.json
```
