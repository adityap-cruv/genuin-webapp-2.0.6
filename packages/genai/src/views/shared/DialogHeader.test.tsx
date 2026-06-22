import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { DialogHeader } from './DialogHeader';

describe('DialogHeader', () => {
    it('renders both minimize and close buttons', () => {
        render(<DialogHeader onMinimize={() => {}} onClose={() => {}} />);
        expect(screen.getByTitle('Minimize dialog')).toBeInTheDocument();
        expect(screen.getByTitle('Close dialog')).toBeInTheDocument();
    });

    it('clicking minimize calls onMinimize, not onClose', async () => {
        const onMinimize = vi.fn();
        const onClose = vi.fn();
        render(<DialogHeader onMinimize={onMinimize} onClose={onClose} />);
        await userEvent.click(screen.getByTitle('Minimize dialog'));
        expect(onMinimize).toHaveBeenCalledTimes(1);
        expect(onClose).not.toHaveBeenCalled();
    });

    it('clicking close calls onClose, not onMinimize', async () => {
        const onMinimize = vi.fn();
        const onClose = vi.fn();
        render(<DialogHeader onMinimize={onMinimize} onClose={onClose} />);
        await userEvent.click(screen.getByTitle('Close dialog'));
        expect(onClose).toHaveBeenCalledTimes(1);
        expect(onMinimize).not.toHaveBeenCalled();
    });
});
