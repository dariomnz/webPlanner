import { useState, useCallback } from 'react';

interface UseMenuVisibilityProps {
    isEditMode: boolean;
    activeId: string | null;
    activeItemSource?: 'menu' | 'planner' | 'section';
}

export function useMenuVisibility({ isEditMode, activeId, activeItemSource }: UseMenuVisibilityProps) {
    const [isMenuVisible, setIsMenuVisible] = useState<boolean>(false);

    const toggleMenu = useCallback(() => {
        setIsMenuVisible(prev => !prev);
    }, []);

    // Explicit method to show menu (to be called from drag end)
    const showMenuOnMobile = useCallback(() => {
        if (window.innerWidth < 768 && !isEditMode) {
            setIsMenuVisible(true);
        }
    }, [isEditMode]);

    // Hide menu on mobile when dragging starts (only in planning mode)
    if (isMenuVisible && window.innerWidth < 768 && !isEditMode && activeId && activeItemSource === 'menu') {
        setIsMenuVisible(false);
    }

    return {
        isMenuVisible,
        setIsMenuVisible,
        toggleMenu,
        showMenuOnMobile,
    };
}
