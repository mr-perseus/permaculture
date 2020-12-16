import React, { ReactElement, useState } from 'react';
import {
    Badge,
    Button,
    ButtonGroup,
    Caption,
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
    SellingPlanGroup,
    Type,
} from '../lib/sellingPlanGroupReducer';

function SellingPlanHeader({
    plan,
    anyIsEdited,
    dispatch,
}: {
    plan: SellingPlan;
    anyIsEdited: boolean;
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
            {!plan.toDelete && !anyIsEdited && (
                <Stack.Item>
                    <Button
                        plain
                        onClick={() =>
                            dispatch({
                                type: Type.StartEditSellingPlan,
                                payload: plan.id,
                            })
                        }
                    >
                        Edit
                    </Button>
                    <div style={{ width: '10px' }} />
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
    const [name, setName] = useState(plan.name);
    const [description, setDescription] = useState(plan.description);
    const [interval, setInterval] = useState(plan.deliveryPolicy.interval);
    const [intervalCount, setIntervalCount] = useState(
        String(plan.deliveryPolicy.intervalCount),
    );

    const handleSubmit = () => {
        dispatch({
            type: Type.UpdateSellingPlan,
            payload: {
                id: plan.id,
                name,
                description,
                deliveryPolicy: {
                    interval,
                    intervalCount: Number(intervalCount),
                },
            },
        });
    };

    const handleIntervalChnage = (val: string): void => {
        const newInterval = val as Interval;
        setInterval(() => newInterval);
    };

    const handleCancel = () => dispatch({ type: Type.CancelEditSellingPlan });
    return (
        <Form
            onSubmit={() => {
                handleSubmit();
            }}
        >
            <FormLayout>
                <TextField label="name" value={name} onChange={setName} />
                <TextField
                    label="description"
                    value={description}
                    onChange={setDescription}
                />
                <FormLayout.Group condensed title="Delivery & billing policy">
                    <Stack>
                        <RadioButton
                            label="DAY"
                            id="DAY"
                            name="delivery"
                            checked={interval === 'DAY'}
                            onChange={(_, newVal) =>
                                handleIntervalChnage(newVal)
                            }
                        />
                        <RadioButton
                            label="WEEK"
                            id="WEEK"
                            name="delivery"
                            checked={interval === 'WEEK'}
                            onChange={(_, newVal) =>
                                handleIntervalChnage(newVal)
                            }
                        />
                        <RadioButton
                            label="MONTH"
                            id="MONTH"
                            name="delivery"
                            checked={interval === 'MONTH'}
                            onChange={(_, newVal) =>
                                handleIntervalChnage(newVal)
                            }
                        />
                    </Stack>
                    <Stack vertical />
                </FormLayout.Group>
                <TextField
                    label="Interval count"
                    type="number"
                    value={intervalCount}
                    onChange={(value) => setIntervalCount(value)}
                />
                <ButtonGroup>
                    <Button submit>Submit</Button>
                    <Button onClick={handleCancel}>Cancel</Button>
                </ButtonGroup>
            </FormLayout>
        </Form>
    );
}

function SellingPlanItem({
    plan,
    isEdited,
    anyIsEdited,
    dispatch,
}: {
    plan: SellingPlan;
    isEdited: boolean;
    anyIsEdited: boolean;
    dispatch: (action: Action) => void;
}) {
    return (
        <Card.Subsection>
            <SellingPlanHeader
                plan={plan}
                anyIsEdited={anyIsEdited}
                dispatch={dispatch}
            />
            {isEdited ? (
                <EditSellingPlan plan={plan} dispatch={dispatch} />
            ) : (
                <>
                    <Caption>{plan.description}</Caption>
                    <Caption>
                        Delivery & billing interval: Every{' '}
                        {plan.deliveryPolicy.intervalCount}{' '}
                        {plan.deliveryPolicy.interval}
                        {plan.deliveryPolicy.intervalCount > 1 && 's'}
                    </Caption>
                </>
            )}
        </Card.Subsection>
    );
}

function SellingPlans({
    sellingPlanGroup,
    dispatch,
}: {
    sellingPlanGroup: SellingPlanGroup;
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
                    changes have to be submitted first and then the selling plan
                    group has to be saved!
                </Card.Section>
                <Card.Section>
                    {sellingPlanGroup.sellingPlans.map((plan) => {
                        const edited =
                            sellingPlanGroup.isEditingPlan &&
                            sellingPlanGroup.currentlyEditingPlanId === plan.id;
                        return (
                            <SellingPlanItem
                                key={plan.id}
                                plan={plan}
                                isEdited={edited}
                                anyIsEdited={sellingPlanGroup.isEditingPlan}
                                dispatch={dispatch}
                            />
                        );
                    })}
                </Card.Section>
            </Card>
        </>
    );
}

export default SellingPlans;
