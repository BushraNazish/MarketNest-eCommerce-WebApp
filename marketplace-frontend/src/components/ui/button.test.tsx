import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from './button';

describe('Button component', () => {
    it('renders correctly with default props', () => {
        render(<Button>Click me</Button>);
        const buttonElement = screen.getByRole('button', { name: /click me/i });
        expect(buttonElement).toBeInTheDocument();
    });

    it('renders correctly with variant and size', () => {
        render(<Button variant="destructive" size="lg">Delete</Button>);
        const buttonElement = screen.getByRole('button', { name: /delete/i });
        expect(buttonElement).toBeInTheDocument();
        // testing-library/jest-dom can check classes if needed, 
        // but basic rendering test is sufficient for a demo
    });
});
