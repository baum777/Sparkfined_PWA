/**
 * MorningMindsetCard Storybook Stories
 */

import type { Meta, StoryObj } from '@storybook/react';
import { MorningMindsetCard } from './MorningMindsetCard';
import * as storage from '../../lib/storage/localRitualStore';

const meta: Meta<typeof MorningMindsetCard> = {
  title: 'Rituals/MorningMindsetCard',
  component: MorningMindsetCard,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: '500px', padding: '20px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Mock storage for Storybook
const mockGetTodaysRitual = storage.getTodaysRitual;

export const NewDay: Story = {
  name: 'New Day (Edit Mode)',
  parameters: {
    docs: {
      description: {
        story: 'User has not set a goal yet today. Shows the goal input form.',
      },
    },
  },
  beforeEach: () => {
    // @ts-ignore - Mock for Storybook
    storage.getTodaysRitual = () => null;
  },
};

export const GoalSet: Story = {
  name: 'Goal Set (Not Completed)',
  parameters: {
    docs: {
      description: {
        story: 'User has set a goal but has not marked it as complete yet.',
      },
    },
  },
  beforeEach: () => {
    // @ts-ignore - Mock for Storybook
    storage.getTodaysRitual = () => ({
      date: '2025-11-10',
      goalHash: 'abc123',
      goal: 'Nur Setups nach Plan handeln. Keine FOMO-Trades.',
      mood: 'calm',
      completed: false,
      streak: 5,
      createdAt: new Date().toISOString(),
      synced: false,
    });
  },
};

export const CompletedRitual: Story = {
  name: 'Completed Ritual',
  parameters: {
    docs: {
      description: {
        story: 'User has completed their daily ritual.',
      },
    },
  },
  beforeEach: () => {
    // @ts-ignore - Mock for Storybook
    storage.getTodaysRitual = () => ({
      date: '2025-11-10',
      goalHash: 'abc123',
      goal: 'Nur Setups nach Plan handeln. Keine FOMO-Trades.',
      mood: 'calm',
      completed: true,
      streak: 7,
      createdAt: new Date().toISOString(),
      synced: false,
    });
  },
};

export const HighStreak: Story = {
  name: 'High Streak (21 Days)',
  parameters: {
    docs: {
      description: {
        story: 'User has maintained a 21-day streak.',
      },
    },
  },
  beforeEach: () => {
    // @ts-ignore - Mock for Storybook
    storage.getTodaysRitual = () => ({
      date: '2025-11-10',
      goalHash: 'abc123',
      goal: 'Disziplin > Emotion. Nur A+ Setups.',
      mood: 'calm',
      completed: false,
      streak: 21,
      createdAt: new Date().toISOString(),
      synced: false,
    });
  },
};

export const AnxiousMood: Story = {
  name: 'Anxious Mood',
  parameters: {
    docs: {
      description: {
        story: 'User is feeling anxious today.',
      },
    },
  },
  beforeEach: () => {
    // @ts-ignore - Mock for Storybook
    storage.getTodaysRitual = () => ({
      date: '2025-11-10',
      goalHash: 'abc123',
      goal: 'Heute nur beobachten. Keine Trades bei Unsicherheit.',
      mood: 'anxious',
      completed: false,
      streak: 3,
      createdAt: new Date().toISOString(),
      synced: false,
    });
  },
};
