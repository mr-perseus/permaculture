import Head from 'next/head';
import { AppProvider } from '@shopify/polaris';
import { Provider } from '@shopify/app-bridge-react';
import Cookies from 'js-cookie';
import '@shopify/polaris/dist/styles.css';
import translations from '@shopify/polaris/locales/en.json';
import ApolloClient from 'apollo-boost';
import { ApolloProvider } from 'react-apollo';
import React from 'react';
import { AppPropsType } from 'next/dist/next-server/lib/utils';
import ClientRouter from '../components/ClientRouter';

const client = new ApolloClient({
    fetchOptions: {
        credentials: 'include',
    },
});

const MyApp: React.FC<AppPropsType> = ({
    Component,
    pageProps,
}: AppPropsType) => {
    const config = {
        apiKey: API_KEY,
        shopOrigin: Cookies.get('shopOrigin') || '',
        forceRedirect: true,
    };

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

export default MyApp;
