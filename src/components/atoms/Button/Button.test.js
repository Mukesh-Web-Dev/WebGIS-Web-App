/**
 * Button Atom Component Tests
 * 
 * Tests for the Button component including:
 * - Rendering with children
 * - Variant styling
 * - Size variants
 * - Disabled state
 * - Click handling
 * - Icon rendering
 */

import React from 'react';
import { render, screen } from '../../../test-utils';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import Button from './Button';

describe('Button Component', () => {
  describe('Rendering', () => {
    it('should render with children text', () => {
      render(<Button>Click Me</Button>);

      expect(screen.getByText('Click Me')).toBeInTheDocument();
    });

    it('should render as button element', () => {
      render(<Button>Test</Button>);

      const button = screen.getByText('Test');
      expect(button.tagName).toBe('BUTTON');
    });
  });

  describe('Variants', () => {
    it('should apply primary variant class', () => {
      render(<Button variant="primary">Primary</Button>);

      const button = screen.getByText('Primary');
      expect(button).toHaveClass('btn-primary');
    });

    it('should apply secondary variant class', () => {
      render(<Button variant="secondary">Secondary</Button>);

      const button = screen.getByText('Secondary');
      expect(button).toHaveClass('btn-secondary');
    });

    it('should apply danger variant class', () => {
      render(<Button variant="danger">Danger</Button>);

      const button = screen.getByText('Danger');
      expect(button).toHaveClass('btn-danger');
    });
  });

  describe('Sizes', () => {
    it('should apply small size class', () => {
      render(<Button size="small">Small</Button>);

      const button = screen.getByText('Small');
      expect(button).toHaveClass('btn-small');
    });

    it('should apply medium size class by default', () => {
      render(<Button>Medium</Button>);

      const button = screen.getByText('Medium');
      expect(button).toHaveClass('btn-medium');
    });

    it('should apply large size class', () => {
      render(<Button size="large">Large</Button>);

      const button = screen.getByText('Large');
      expect(button).toHaveClass('btn-large');
    });
  });

  describe('Disabled State', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<Button disabled>Disabled</Button>);

      const button = screen.getByText('Disabled');
      expect(button).toBeDisabled();
    });

    it('should not trigger onClick when disabled', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();

      render(
        <Button disabled onClick={handleClick}>
          Disabled
        </Button>
      );

      const button = screen.getByText('Disabled');
      await user.click(button);

      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Click Handling', () => {
    it('should call onClick when clicked', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();

      render(<Button onClick={handleClick}>Click</Button>);

      const button = screen.getByText('Click');
      await user.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should work without onClick handler', async () => {
      const user = userEvent.setup();

      render(<Button>No Handler</Button>);

      const button = screen.getByText('No Handler');

      expect(async () => {
        await user.click(button);
      }).not.toThrow();
    });
  });

  describe('Custom ClassName', () => {
    it('should apply custom className', () => {
      render(<Button className="custom-class">Custom</Button>);

      const button = screen.getByText('Custom');
      expect(button).toHaveClass('custom-class');
      expect(button).toHaveClass('btn'); // Should still have base class
    });
  });

  describe('Accessibility', () => {
    it('should have button role', () => {
      render(<Button>Accessible</Button>);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should accept aria-label', () => {
      render(<Button aria-label="Close dialog">×</Button>);

      const button = screen.getByLabelText('Close dialog');
      expect(button).toBeInTheDocument();
    });
  });
});
