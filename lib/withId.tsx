import React from 'react';
import { useRouter } from 'next/router';

const withId = (Component: React.FC<{ id: string }>): React.FC => {
    return () => {
        const router = useRouter();
        const id = router.query?.id;

        if (!id) {
            return <h4>Loading...</h4>;
        }

        return <Component id={String(id)} />;
    };
};

export default withId;
