import { useEffect, useRef } from 'react';

// https://overreacted.io/making-setinterval-declarative-with-react-hooks/
/* eslint-disable @typescript-eslint/ban-types */
const useInterval = (callback: Function, delay: any) => {
    const savedCallback = useRef<Function>();
    /* eslint-enable @typescript-eslint/ban-types */
    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);
    useEffect(() => {
        /* eslint-disable @typescript-eslint/no-unsafe-return,@typescript-eslint/ban-ts-comment */
        // @ts-ignore
        const handler = (...args: any[]) => savedCallback.current(...args);
        /* eslint-enable @typescript-eslint/no-unsafe-return,@typescript-eslint/ban-ts-comment */

        if (delay !== null) {
            const id = setInterval(handler, delay);
            return () => clearInterval(id);
        }

        return () => {};
    }, [delay]);
};

export default useInterval;
