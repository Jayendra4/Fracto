import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Loader from './Loader';
import { AnimatePresence, motion } from 'framer-motion';

const PageLoader: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const prevPathRef = useRef(location.pathname);

    useEffect(() => {
        if (location.pathname !== prevPathRef.current) {
            setLoading(true);
            prevPathRef.current = location.pathname;

            // Use a minimal delay just to ensure the loading state is registered 
            // and the exit animation can play smoothly, but without frustrating the user.
            const timer = setTimeout(() => {
                setLoading(false);
            }, 50);

            return () => clearTimeout(timer);
        }
    }, [location.pathname]);

    return (
        <>
            <AnimatePresence mode="wait">
                {loading && (
                    <motion.div
                        key="page-loader"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="fixed inset-0 z-[10000]"
                    >
                        <Loader isFullPage={true} />
                    </motion.div>
                )}
            </AnimatePresence>
            {children}
        </>
    );
};

export default PageLoader;
