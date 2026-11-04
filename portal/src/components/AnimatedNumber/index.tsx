import { useEffect, useState } from 'react';

export const AnimatedNumber = ({ value }: { value: number }) => {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        let start = displayValue;
        const end = value;

        if (Math.abs(end - start) < 0.1) {
            setDisplayValue(end);
            return;
        }

        const timer = setInterval(() => {
            const diff = end - start;
            const step = diff / 6; // Faster spring-like feeling

            if (Math.abs(diff) < 1) {
                start = end;
                setDisplayValue(end);
                clearInterval(timer);
            } else {
                start += step;
                setDisplayValue(Math.round(start));
            }
        }, 16);

        return () => clearInterval(timer);
    }, [value]);

    return <>{displayValue.toLocaleString('en-IN')}</>;
};
