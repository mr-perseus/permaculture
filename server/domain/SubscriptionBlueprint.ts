// todo enable eslint...
/* eslint-disable */
import ShopifyService from './ShopifyService';
import SubscriptionContext from "./SubscriptionContext";

export default class SubscriptionBlueprint {
    public id = "";
    public productId = "";
    public title = "";

    private shopifyService?: ShopifyService = undefined;
    private context?: SubscriptionContext = undefined;

    constructor(title: string) {
        this.title = title;
    }

    setContextAndServices(shopifyService: ShopifyService, context: SubscriptionContext) {
        this.shopifyService = shopifyService;
        this.context = context;
    }

    async createShopifyProduct() {
        if (!this.shopifyService || !this.context) {
            throw new Error("Subscription Blueprint not initialized properly");
        }
        this.productId = await this.shopifyService.createProduct(this.title, this.context);
    }
}