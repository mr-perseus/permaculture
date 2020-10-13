import { Session } from 'koa-session';
import SubscriptionBlueprint from './SubscriptionBlueprint';
import SubscriptionBlueprintRepository from './SubscriptionBlueprintRepository';
import SubscriptionContext from './SubscriptionContext';

export default class SubscriptionService {
    private subscriptionBlueprintRepository: SubscriptionBlueprintRepository;

    constructor(
        subscriptionBlueprintRepository: SubscriptionBlueprintRepository,
    ) {
        this.subscriptionBlueprintRepository = subscriptionBlueprintRepository;
    }

    async createSubscriptionBlueprint(
        title: string,
        session: Session,
    ): Promise<SubscriptionBlueprint> {
        return this.subscriptionBlueprintRepository.createBlueprint(title, {
            shop: session.shop as string,
            accessToken: session.accessToken as string,
        } as SubscriptionContext);
    }
}
