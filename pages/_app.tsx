import Head from 'next/head';
import { AppProvider } from '@shopify/polaris';
import { Provider } from '@shopify/app-bridge-react';
import '@shopify/polaris/dist/styles.css';
import translations from '@shopify/polaris/locales/en.json';
import ApolloClient from 'apollo-boost';
import { ApolloProvider } from 'react-apollo';
import { AppContext, AppProps } from 'next/app';
import React from 'react';
import ClientRouter from '../components/ClientRouter';

const client = new ApolloClient({
    fetchOptions: {
        credentials: 'include',
    },
});

const MyApp = ({
    Component,
    pageProps,
    shopOrigin,
}: AppProps & { shopOrigin: string }) => {
    const config = { apiKey: API_KEY, shopOrigin, forceRedirect: true };

    return (
        <>
            <Head>
                <title>Sample App</title>
                <meta charSet="utf-8" />
            </Head>
            <Provider config={config}>
                <ClientRouter />
                {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}
                <AppProvider i18n={translations}>
                    <ApolloProvider client={client}>
                        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
                        <Component {...pageProps} />
                    </ApolloProvider>
                </AppProvider>
            </Provider>
        </>
    );
};

MyApp.getInitialProps = ({ ctx }: AppContext) => {
    return {
        shopOrigin: ctx.query.shop,
    };
};

export default MyApp;
