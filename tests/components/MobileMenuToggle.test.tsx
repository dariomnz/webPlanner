import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MobileMenuToggle from '../../src/components/MobileMenuToggle/MobileMenuToggle';

// Mock child component
vi.mock('../../src/components/Common/HeartAnimation.tsx', () => ({
    default: () => <div data-testid="heart-animation" />
}));

// Mock icons
vi.mock('../../src/components/Common/Icons.tsx', () => ({
    X: () => <div data-testid="x-icon" />,
    Menu: () => <div data-testid="menu-icon" />,
    Heart: () => <div data-testid="heart-icon" />,
}));

describe('MobileMenuToggle', () => {
    const setIsMenuVisible = vi.fn();
    const setIsEditMode = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders menu icon when menu is hidden', () => {
        render(
            <MobileMenuToggle
                isMenuVisible={false}
                setIsMenuVisible={setIsMenuVisible}
                setIsEditMode={setIsEditMode}
            />
        );

        expect(screen.getByTestId('menu-icon')).toBeInTheDocument();
        expect(screen.queryByTestId('heart-animation')).not.toBeInTheDocument();
    });

    it('renders X icon and heart animation when menu is visible', () => {
        render(
            <MobileMenuToggle
                isMenuVisible={true}
                setIsMenuVisible={setIsMenuVisible}
                setIsEditMode={setIsEditMode}
            />
        );

        expect(screen.getByTestId('x-icon')).toBeInTheDocument();
        expect(screen.getByTestId('heart-animation')).toBeInTheDocument();
    });

    it('toggles menu when button is clicked', () => {
        render(
            <MobileMenuToggle
                isMenuVisible={false}
                setIsMenuVisible={setIsMenuVisible}
                setIsEditMode={setIsEditMode}
            />
        );

        fireEvent.click(screen.getByLabelText('Mostrar menú'));
        expect(setIsMenuVisible).toHaveBeenCalledWith(true);
    });

    it('toggles menu and potentially resets edit mode when closing menu', () => {
        render(
            <MobileMenuToggle
                isMenuVisible={true}
                setIsMenuVisible={setIsMenuVisible}
                setIsEditMode={setIsEditMode}
            />
        );

        fireEvent.click(screen.getByLabelText('Ocultar menú'));
        expect(setIsMenuVisible).toHaveBeenCalledWith(false);
        expect(setIsEditMode).toHaveBeenCalled();
    });
});
