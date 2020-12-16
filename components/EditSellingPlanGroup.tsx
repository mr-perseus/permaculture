import React, { ReactElement } from 'react';
import { Card, Form, FormLayout, TextField } from '@shopify/polaris';
import { Action, SellingPlanGroup, Type } from '../lib/sellingPlanGroupReducer';

export type ProductResult = {
    id: string;
    title: string;
};

const EditSellingPlanGroup = ({
    sellingPlanGroup,
    dispatch,
}: {
    sellingPlanGroup: SellingPlanGroup;
    dispatch: (action: Action) => void;
}): ReactElement => {
    return (
        <Card title="Edit details">
            <Card.Section>
                <Form
                    onSubmit={() => {
                        /* handled by page action */
                    }}
                >
                    <FormLayout>
                        <TextField
                            label="Name"
                            value={sellingPlanGroup.name}
                            onChange={(newValue) => {
                                dispatch({
                                    type: Type.UpdateName,
                                    payload: newValue,
                                });
                            }}
                        />
                        <TextField
                            label="Description"
                            value={sellingPlanGroup.description}
                            onChange={(newValue) =>
                                dispatch({
                                    type: Type.UpdateDescription,
                                    payload: newValue,
                                })
                            }
                        />
                    </FormLayout>
                </Form>
            </Card.Section>
        </Card>
    );
};

export default EditSellingPlanGroup;
