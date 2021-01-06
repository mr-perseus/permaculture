import { NextRouter, useRouter } from 'next/router';

interface RouterWithShop extends NextRouter {
    push: (url: string) => Promise<boolean>;
    replace: (url: string) => Promise<boolean>;
}

const useRouterWithShopQuery: () => RouterWithShop = () => {
    const router = useRouter();

    return {
        ...router,
        push: async (url: string) => {
            return router.push({
                pathname: url,
                query: { shop: router.query.shop },
            });
        },
        replace: async (url: string) => {
            return router.replace({
                pathname: url,
                query: { shop: router.query.shop },
            });
        },
    };
};

export default useRouterWithShopQuery;
