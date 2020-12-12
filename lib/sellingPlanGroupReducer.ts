let pseudoId = 0;

export enum Type {
    Load,
    UpdateName,
    UpdateDescription,
    RemoveSellingPlan,
    AddSellingPlan,
    UpdateSellingPlan,
    CreateSellingPlanGroup,
}

export type Action =
    | {
          type: Type.Load;
          payload: SellingPlanGroup;
      }
    | {
          type: Type.UpdateName;
          payload: string;
      }
    | {
          type: Type.UpdateDescription;
          payload: string;
      }
    | {
          type: Type.AddSellingPlan;
      }
    | {
          type: Type.RemoveSellingPlan;
          payload: string;
      }
    | {
          type: Type.UpdateSellingPlan;
          payload: SellingPlan;
      }
    | {
          type: Type.CreateSellingPlanGroup;
      };

export type Interval = 'DAY' | 'WEEK' | 'MONTH';

export type SellingPlan = {
    name: string;
    description: string;
    id: string;
    toCreate?: boolean;
    toDelete?: boolean;
    toUpdate?: boolean;
    deliveryPolicy: {
        interval: Interval;
    };
};

export type SellingPlanGroup = {
    id?: string;
    name: string;
    description: string;
    sellingPlans: SellingPlan[];
};

// eslint-disable-next-line import/no-mutable-exports
let sellingPlanGroupReducer = (
    sellingPlanGroup: SellingPlanGroup,
    action: Action,
): SellingPlanGroup => {
    switch (action.type) {
        case Type.Load: {
            return action.payload;
        }
        case Type.CreateSellingPlanGroup: {
            return {
                name: 'New subscription',
                description: '',
                sellingPlans: [],
            };
        }
        case Type.UpdateName: {
            return { ...sellingPlanGroup, name: action.payload };
        }
        case Type.UpdateDescription: {
            return { ...sellingPlanGroup, description: action.payload };
        }
        case Type.RemoveSellingPlan: {
            const updatedSellingPlans = sellingPlanGroup.sellingPlans.reduce(
                (acc, plan) => {
                    if (plan.id === action.payload) {
                        if (!plan.toCreate) {
                            acc.push({ ...plan, toDelete: true });
                        }
                        // freshly created plans will be directly deleted
                    } else {
                        acc.push(plan);
                    }
                    return acc;
                },
                [] as SellingPlan[],
            );
            return {
                ...sellingPlanGroup,
                sellingPlans: updatedSellingPlans,
            };
        }
        case Type.AddSellingPlan: {
            pseudoId += 1;
            const updatedSellingPlans = sellingPlanGroup.sellingPlans.concat([
                {
                    id: String(pseudoId),
                    name: 'New plan',
                    description: '',
                    toCreate: true,
                    deliveryPolicy: {
                        interval: 'DAY',
                    },
                },
            ]);
            return {
                ...sellingPlanGroup,
                sellingPlans: updatedSellingPlans,
            };
        }
        case Type.UpdateSellingPlan: {
            return {
                ...sellingPlanGroup,
                sellingPlans: sellingPlanGroup.sellingPlans.map((plan) => {
                    if (plan.id !== action.payload.id) {
                        return plan;
                    }
                    return {
                        ...plan,
                        ...action.payload,
                        toUpdate: !plan.toCreate,
                    };
                }),
            };
        }
        default:
            throw Error(`No valid action ${action as string}`);
    }
};

const withLogging = (
    fn: (prevState: SellingPlanGroup, action: Action) => SellingPlanGroup,
): ((prevState: SellingPlanGroup, action: Action) => SellingPlanGroup) => {
    return (prevState, input) => {
        // eslint-disable-next-line no-console
        console.debug('IN', input);
        const output = fn(prevState, input);
        // eslint-disable-next-line no-console
        console.debug('OUT', output);
        return output;
    };
};

if (process.env.NODE_ENV !== 'production') {
    sellingPlanGroupReducer = withLogging(sellingPlanGroupReducer);
}

export default sellingPlanGroupReducer;
