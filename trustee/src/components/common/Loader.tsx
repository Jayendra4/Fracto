import React from 'react';

const Loader: React.FC = () => {
    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-background/50 backdrop-blur-sm">
            <div className="dot-spinner">
                <div className="dot-spinner__dot"></div>
                <div className="dot-spinner__dot"></div>
                <div className="dot-spinner__dot"></div>
                <div className="dot-spinner__dot"></div>
                <div className="dot-spinner__dot"></div>
                <div className="dot-spinner__dot"></div>
                <div className="dot-spinner__dot"></div>
                <div className="dot-spinner__dot"></div>
            </div>
        </div>
    );
};

export default Loader;
