import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ThemeToggle from '../../src/components/ThemeToggle/ThemeToggle';
import { dataStore } from '../../src/store/DataStore';

// Mock the icons to avoid potential issues with SVG rendering in jsdom
vi.mock('../../src/components/Common/Icons', () => ({
    Sun: () => <div data-testid="sun-icon" />,
    Moon: () => <div data-testid="moon-icon" />,
    Palette: () => <div data-testid="palette-icon" />,
}));

describe('ThemeToggle', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('toggles dark mode when button is clicked', () => {
        const setDarkModeSpy = vi.spyOn(dataStore, 'setDarkMode');
        render(<ThemeToggle />);

        const toggleButton = screen.getByTitle(/Cambiar a modo/i);
        fireEvent.click(toggleButton);

        expect(setDarkModeSpy).toHaveBeenCalled();
    });

    it('opens theme dropdown when palette is clicked', () => {
        render(<ThemeToggle />);

        const paletteButton = screen.getByTestId('palette-icon').parentElement!;
        fireEvent.click(paletteButton);

        expect(screen.getByText('Rosa')).toBeInTheDocument();
        expect(screen.getByText('Azul')).toBeInTheDocument();
    });

    it('selects a theme from the dropdown', () => {
        const setAppThemeSpy = vi.spyOn(dataStore, 'setAppTheme');
        render(<ThemeToggle />);

        // Open dropdown
        const paletteButton = screen.getByTestId('palette-icon').parentElement!;
        fireEvent.click(paletteButton);

        // Click a theme
        const blueThemeButton = screen.getByText('Azul');
        fireEvent.click(blueThemeButton);

        expect(setAppThemeSpy).toHaveBeenCalledWith('blue');
        // Dropdown should be closed after selection
        expect(screen.queryByText('Rosa')).not.toBeInTheDocument();
    });
});
