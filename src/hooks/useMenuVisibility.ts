import { useState, useCallback } from 'react';

export function useMenuVisibility() {
    const [isMenuVisible, setIsMenuVisible] = useState<boolean>(false);

    const toggleMenu = useCallback(() => {
        setIsMenuVisible(prev => !prev);
    }, [setIsMenuVisible]);

    return {
        isMenuVisible,
        setIsMenuVisible,
        toggleMenu,
    };
}
