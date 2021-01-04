import React, { ReactElement, useMemo, useState } from 'react';
import { Tabs } from '@shopify/polaris';
import SubscriptionsTab from '../components/SubscriptionsTab';
import ContractsTab from '../components/ContractsTab';

const AppTab = ({ selected }: { selected: number }): ReactElement => {
    switch (selected) {
        case 0:
            return <SubscriptionsTab />;
        case 1:
            return <ContractsTab />;
        default:
            return <h1>Fatal error</h1>;
    }
};

const AppTabs = (): ReactElement => {
    const tabs = useMemo(
        () => [
            { id: 'subscriptions', content: 'Subscriptions' },
            { id: 'contracts', content: 'Contracts' },
        ],
        [],
    );

    const [selected, setSelected] = useState(0);

    return (
        <Tabs tabs={tabs} selected={selected} onSelect={setSelected} fitted>
            <AppTab selected={selected} />
        </Tabs>
    );
};

export default AppTabs;
