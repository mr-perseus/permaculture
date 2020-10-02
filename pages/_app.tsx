import App from 'next/app';
import Head from 'next/head';
import { AppProvider } from '@shopify/polaris';
import { Provider } from '@shopify/app-bridge-react';
import Cookies from 'js-cookie';
import '@shopify/polaris/dist/styles.css';
import translations from '@shopify/polaris/locales/en.json';
import ApolloClient from 'apollo-boost';
import { ApolloProvider } from 'react-apollo';
import React from 'react';
import ClientRouter from '../components/ClientRouter';

const client = new ApolloClient({
    fetchOptions: {
        credentials: 'include',
    },
});

class MyApp extends App {
    render() {
        const { Component, pageProps } = this.props;
        const config = {
            // @ts-ignore
            apiKey: API_KEY,
            shopOrigin: Cookies.get('shopOrigin'),
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
                    <AppProvider i18n={translations}>
                        <ApolloProvider client={client}>
                            <Component {...pageProps} />
                        </ApolloProvider>
                    </AppProvider>
                </Provider>
            </>
        );
    }
}

export default MyApp;
