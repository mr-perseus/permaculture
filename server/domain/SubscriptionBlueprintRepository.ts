import ShopifyService from './ShopifyService';
import SubscriptionBlueprint from './SubscriptionBlueprint';
import SubscriptionContext from './SubscriptionContext';

export default class SubscriptionBlueprintRepository {
    private readonly shopifyService: ShopifyService;

    private readonly blueprints: Array<SubscriptionBlueprint>;

    constructor(shopifyService: ShopifyService) {
        this.shopifyService = shopifyService;
        this.blueprints = new Array<SubscriptionBlueprint>();
    }

    async createBlueprint(
        title: string,
        context: SubscriptionContext,
    ): Promise<SubscriptionBlueprint> {
        const subscriptionBlueprint = new SubscriptionBlueprint(title);
        subscriptionBlueprint.setContextAndServices(
            this.shopifyService,
            context,
        );
        await subscriptionBlueprint.createShopifyProduct();
        this.blueprints.push(subscriptionBlueprint);
        return subscriptionBlueprint;
    }

    async getBlueprint(
        id: string,
        context: SubscriptionContext,
    ): Promise<SubscriptionBlueprint | undefined> {
        const blueprint = this.blueprints.find(
            (candidate) => candidate.id === id,
        );
        if (blueprint) {
            blueprint.setContextAndServices(this.shopifyService, context);
        }
        return Promise.resolve(blueprint);
    }

    async getBlueprints(): Promise<Array<SubscriptionBlueprint>> {
        return Promise.resolve(this.blueprints);
    }
}
