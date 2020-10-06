import { withRouter } from 'next/router';
import { ClientRouter as AppBridgeClientRouter } from '@shopify/app-bridge-react';
import React from 'react';

export default withRouter(({ router }) => (
    <AppBridgeClientRouter history={router} />
));
