import { useEffect, useRef } from 'react';

// https://overreacted.io/making-setinterval-declarative-with-react-hooks/
const useInterval = (callback: any, delay: any) => {
    const savedCallback = useRef();
    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);
    // @ts-ignore
    useEffect(() => {
        // @ts-ignore
        const handler = (...args) => savedCallback.current(...args);

        if (delay !== null) {
            const id = setInterval(handler, delay);
            return () => clearInterval(id);
        }
    }, [delay]);
};

export default useInterval;
