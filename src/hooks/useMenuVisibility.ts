import { useState, useCallback, useEffect } from 'react';

interface UseMenuVisibilityProps {
    isEditMode: boolean;
    activeId: string | null;
    activeItemSource?: 'menu' | 'planner' | 'section';
}

export function useMenuVisibility({ isEditMode, activeId, activeItemSource }: UseMenuVisibilityProps) {
    const [isMenuVisible, setIsMenuVisible] = useState<boolean>(false);

    const toggleMenu = useCallback(() => {
        // console.log('toggle menu');
        setIsMenuVisible(!isMenuVisible);
    }, [isMenuVisible]);

    // Explicit method to show menu (to be called from drag end)
    const showMenuOnMobile = useCallback(() => {
        if (window.innerWidth < 768 && !isEditMode) {
            // console.log('show menu');
            setIsMenuVisible(true);
        }
    }, [isEditMode]);

    // Hide menu on mobile when dragging starts (only in planning mode)
    useEffect(() => {
        if (window.innerWidth < 768 && !isEditMode && activeId && activeItemSource === 'menu') {
            // console.log('hide menu');
            setIsMenuVisible(false);
        }
    }, [activeId, activeItemSource, isEditMode]);

    return {
        isMenuVisible,
        setIsMenuVisible,
        toggleMenu,
        showMenuOnMobile,
    };
}
