import React from 'react';
import { extend, render } from '@shopify/argo-admin-react';
import AddSellingPlan from './AddSellingPlan';
import Remove from './RemoveSellingPlan';
import CreateSellingPlan from './CreateSellingPlan';
import EditSellingPlan from './EditSellingPlan';

extend(
    'Admin::Product::SubscriptionPlan::Add',
    render(() => <AddSellingPlan />),
);
extend(
    'Admin::Product::SubscriptionPlan::Create',
    render(() => <CreateSellingPlan />),
);
extend(
    'Admin::Product::SubscriptionPlan::Remove',
    render(() => <Remove />),
);
extend(
    'Admin::Product::SubscriptionPlan::Edit',
    render(() => <EditSellingPlan />),
);
