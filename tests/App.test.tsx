import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from '../src/App';

// Mock components that might be complex or unnecessary for a simple smoke test
vi.mock('../src/components/MenuExercise/MenuExercise.tsx', () => ({
    default: () => <div data-testid="menu-exercise">Menu Exercise</div>
}));

vi.mock('../src/components/ClassPlanner/ClassPlanner.tsx', () => ({
    default: () => <div data-testid="class-planner">Class Planner</div>
}));

vi.mock('../src/components/MobileMenuToggle/MobileMenuToggle.tsx', () => ({
    default: () => <div data-testid="mobile-menu-toggle">Mobile Menu Toggle</div>
}));

describe('App Component', () => {
    it('renders the main layout', () => {
        render(<App />);

        expect(screen.getByTestId('menu-exercise')).toBeInTheDocument();
        expect(screen.getByTestId('class-planner')).toBeInTheDocument();
        expect(screen.getByTestId('mobile-menu-toggle')).toBeInTheDocument();
    });
});
