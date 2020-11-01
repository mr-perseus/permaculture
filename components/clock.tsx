import { useSelector } from 'react-redux';

import React from 'react';
import { selectClock } from '../lib/slices/clockSlice';

const formatTime = (time: number) => {
    return new Date(time).toJSON().slice(11, 19);
};

const Clock: React.FC = () => {
    const { lastUpdate, light } = useSelector(selectClock);

    return (
        <div className={light ? 'light' : ''}>
            {formatTime(lastUpdate)}
            <style jsx>{`
                div {
                    padding: 15px;
                    display: inline-block;
                    color: #82fa58;
                    font: 50px menlo, monaco, monospace;
                    background-color: #000;
                }

                .light {
                    background-color: #999;
                }
            `}</style>
        </div>
    );
};

export default Clock;
