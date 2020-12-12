import React, { ReactElement } from 'react';
import {
    Badge,
    Button,
    Card,
    Form,
    FormLayout,
    Heading,
    RadioButton,
    Stack,
    TextField,
} from '@shopify/polaris';
import {
    Action,
    Interval,
    SellingPlan,
    Type,
} from '../lib/sellingPlanGroupReducer';

function SellingPlanHeader({
    plan,
    dispatch,
}: {
    plan: SellingPlan;
    dispatch: (action: Action) => void;
}) {
    return (
        <Stack>
            <Stack.Item>
                <Heading>{plan.name}</Heading>
            </Stack.Item>
            <Stack.Item fill>
                {plan.toDelete && <Badge status="critical">Removed</Badge>}
                {plan.toCreate && <Badge status="new">New</Badge>}
                {plan.toUpdate && !plan.toDelete && (
                    <Badge status="info">Updated</Badge>
                )}
            </Stack.Item>
            {!plan.toDelete && (
                <Stack.Item>
                    <Button
                        plain
                        destructive
                        onClick={() =>
                            dispatch({
                                type: Type.RemoveSellingPlan,
                                payload: plan.id,
                            })
                        }
                    >
                        Remove
                    </Button>
                </Stack.Item>
            )}
        </Stack>
    );
}

function EditSellingPlan({
    plan,
    dispatch,
}: {
    plan: SellingPlan;
    dispatch: (action: Action) => void;
}) {
    const handleDeliveryChange = (_checked: never, newVal: Interval) => {
        dispatch({
            type: Type.UpdateSellingPlan,
            payload: {
                ...plan,
                deliveryPolicy: {
                    ...plan.deliveryPolicy,
                    interval: newVal,
                },
            },
        });
    };

    return (
        <Card.Subsection>
            <SellingPlanHeader plan={plan} dispatch={dispatch} />
            {!plan.toDelete && (
                <Form
                    onSubmit={() => {
                        /* handled by page */
                    }}
                >
                    <FormLayout>
                        <TextField
                            label="name"
                            value={plan.name}
                            onChange={(newValue) =>
                                dispatch({
                                    type: Type.UpdateSellingPlan,
                                    payload: {
                                        ...plan,
                                        name: newValue,
                                    },
                                })
                            }
                        />
                        <FormLayout.Group
                            condensed
                            title="Delivery & billing policy"
                        >
                            <Stack>
                                <RadioButton
                                    label="DAY"
                                    id="DAY"
                                    name="delivery"
                                    checked={
                                        plan.deliveryPolicy.interval === 'DAY'
                                    }
                                    onChange={handleDeliveryChange}
                                />
                                <RadioButton
                                    label="WEEK"
                                    id="WEEK"
                                    name="delivery"
                                    checked={
                                        plan.deliveryPolicy.interval === 'WEEK'
                                    }
                                    onChange={handleDeliveryChange}
                                />
                                <RadioButton
                                    label="MONTH"
                                    id="MONTH"
                                    name="delivery"
                                    checked={
                                        plan.deliveryPolicy.interval === 'MONTH'
                                    }
                                    onChange={handleDeliveryChange}
                                />
                            </Stack>
                            <Stack vertical />
                        </FormLayout.Group>
                    </FormLayout>
                </Form>
            )}
        </Card.Subsection>
    );
}

function EditSellingPlans({
    sellingPlans,
    dispatch,
}: {
    sellingPlans: SellingPlan[];
    dispatch: (action: Action) => void;
}): ReactElement {
    return (
        <>
            <Card>
                <Card.Header
                    title="Selling plans"
                    actions={[
                        {
                            content: 'Add selling plan',
                            onAction() {
                                dispatch({ type: Type.AddSellingPlan });
                            },
                        },
                    ]}
                />
                <Card.Section>
                    Add, remove and edit the selling plans in this selling plan
                    group. For any changes to take effect, the selling plan
                    group has to be saved first!
                </Card.Section>
                <Card.Section>
                    {sellingPlans.map((plan) => (
                        <EditSellingPlan
                            key={plan.id}
                            plan={plan}
                            dispatch={dispatch}
                        />
                    ))}
                </Card.Section>
            </Card>
        </>
    );
}

export default EditSellingPlans;
