/**
 * PostTradeReviewDrawer Storybook Stories
 */

import type { Meta, StoryObj } from '@storybook/react';
import { PostTradeReviewDrawer } from './PostTradeReviewDrawer';
import { fn } from '@storybook/test';

const meta: Meta<typeof PostTradeReviewDrawer> = {
  title: 'Rituals/PostTradeReviewDrawer',
  component: PostTradeReviewDrawer,
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'dark',
    },
  },
  tags: ['autodocs'],
  args: {
    onClose: fn(),
    onSave: fn(),
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
        story: 'Empty post-trade review drawer ready for journaling.',
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
        story: 'Drawer pre-filled with trading symbol from context.',
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
        story: 'Drawer is closed and not visible.',
      },
    },
  },
};

export const WinningTrade: Story = {
  name: 'Winning Trade Example',
  args: {
    isOpen: true,
    defaultSymbol: 'SOL/USDT',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Example of reviewing a winning trade. Note: User would fill PnL as positive number.',
      },
    },
  },
};

export const LosingTrade: Story = {
  name: 'Losing Trade Example',
  args: {
    isOpen: true,
    defaultSymbol: 'AVAX/USDT',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Example of reviewing a losing trade. Note: User would fill PnL as negative number and reflect on lessons learned.',
      },
    },
  },
};

export const MobileView: Story = {
  name: 'Mobile View',
  args: {
    isOpen: true,
    defaultSymbol: 'BTC/USDT',
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story: 'Drawer optimized for mobile devices with bottom sheet design.',
      },
    },
  },
};
