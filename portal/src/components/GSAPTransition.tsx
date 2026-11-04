import React, { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

interface GSAPTransitionProps {
    children?: React.ReactNode;
    initial?: gsap.TweenVars;
    animate?: gsap.TweenVars;
    exit?: gsap.TweenVars;
    transition?: gsap.TweenVars;
    className?: string;
    show?: boolean;
    onExitComplete?: () => void;
    onEnterComplete?: () => void;
    onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
    style?: React.CSSProperties;
}

/**
 * A robust wrapper for GSAP animations that mimics common motion.div patterns.
 */
export const GSAPTransition: React.FC<GSAPTransitionProps> = ({
    children,
    initial,
    animate,
    exit,
    transition,
    className,
    show = true,
    onExitComplete,
    onEnterComplete,
    onClick,
    style,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isMounted, setIsMounted] = useState(show);

    useEffect(() => {
        if (show) setIsMounted(true);
    }, [show]);

    useGSAP(
        () => {
            if (!containerRef.current) return;

            if (show) {
                // If we have initial state and were just mounted or show toggled
                if (initial) {
                    gsap.set(containerRef.current, initial);
                }

                gsap.to(containerRef.current, {
                    ...animate,
                    ...transition,
                    onComplete: () => {
                        if (onEnterComplete) onEnterComplete();
                    },
                });
            } else if (exit) {
                // Exit animation
                gsap.to(containerRef.current, {
                    ...exit,
                    ...transition,
                    onComplete: () => {
                        if (onExitComplete) onExitComplete();
                        setIsMounted(false);
                    },
                });
            } else {
                // If no exit animation and show becomes false
                if (onExitComplete) onExitComplete();
                setIsMounted(false);
            }
        },
        { dependencies: [show], scope: containerRef }
    );

    if (!isMounted && !show) return null;

    return (
        <div
            ref={containerRef}
            className={className}
            onClick={onClick}
            style={style}
        >
            {children}
        </div>
    );
};

export default GSAPTransition;
