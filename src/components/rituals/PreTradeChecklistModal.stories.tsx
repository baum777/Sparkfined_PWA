/**
 * PreTradeChecklistModal Storybook Stories
 */

import type { Meta, StoryObj } from '@storybook/react';
import { PreTradeChecklistModal } from './PreTradeChecklistModal';
import { fn } from '@storybook/test';

const meta: Meta<typeof PreTradeChecklistModal> = {
  title: 'Rituals/PreTradeChecklistModal',
  component: PreTradeChecklistModal,
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'dark',
    },
  },
  tags: ['autodocs'],
  args: {
    onClose: fn(),
    onSubmit: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: 'Default (Empty)',
  args: {
    isOpen: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Empty pre-trade checklist ready to be filled out.',
      },
    },
  },
};

export const WithDefaultSymbol: Story = {
  name: 'With Default Symbol',
  args: {
    isOpen: true,
    defaultSymbol: 'BTC/USDT',
  },
  parameters: {
    docs: {
      description: {
        story: 'Checklist pre-filled with a symbol (e.g., from chart context).',
      },
    },
  },
};

export const Closed: Story = {
  name: 'Closed (Hidden)',
  args: {
    isOpen: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Modal is closed and not visible.',
      },
    },
  },
};

export const FilledExample: Story = {
  name: 'Filled Example',
  args: {
    isOpen: true,
    defaultSymbol: 'ETH/USDT',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Example of a filled checklist. Note: In real usage, user would fill these fields.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    // Auto-fill for demo purposes (optional)
    // Could use @storybook/addon-interactions here
  },
};
