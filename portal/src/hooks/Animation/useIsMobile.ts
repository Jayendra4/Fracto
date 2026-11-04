import { useEffect, useState } from "react";

function useIsMobile() {
    const [isMobile, setIsMobile] = useState<boolean>(
        typeof window !== 'undefined' ? window.innerWidth < 1024 : false
    );

    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth < 1024);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    return isMobile;
}
export default useIsMobile;