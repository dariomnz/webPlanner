import { useState, useCallback, useEffect } from 'react';

interface UseMenuVisibilityProps {
    isEditMode: boolean;
    activeId: string | null;
    activeItemSource?: 'menu' | 'planner';
}

export function useMenuVisibility({ isEditMode, activeId, activeItemSource }: UseMenuVisibilityProps) {
    const [isMenuVisible, setIsMenuVisible] = useState<boolean>(false);

    const toggleMenu = useCallback(() => {
        setIsMenuVisible(!isMenuVisible);
    }, [isMenuVisible]);

    // Hide menu on mobile when dragging starts (only in planning mode)
    useEffect(() => {
        if (window.innerWidth < 768 && !isEditMode && activeId && activeItemSource === 'menu') {
            setIsMenuVisible(false);
        }
    }, [activeId, activeItemSource, isEditMode]);

    // Show menu again on mobile when dragging ends (only in planning mode)
    useEffect(() => {
        if (window.innerWidth < 768 && !isEditMode && !activeId) {
            setIsMenuVisible(true);
        }
    }, [activeId, isEditMode]);

    return {
        isMenuVisible,
        setIsMenuVisible,
        toggleMenu,
    };
}
