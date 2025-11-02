/**
 * Storybook Stories for Sparkfined Design System
 * 
 * Run Storybook with: npx storybook dev
 * Build Storybook with: npx storybook build
 */

import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'
import {
  Button,
  Card,
  Input,
  Select,
  Checkbox,
  Toggle,
  LoadingSkeleton,
  EmptyState,
  ErrorState,
  Badge,
  Modal,
  KpiCard
} from './component-examples'

// ============================================================================
// BUTTON STORIES
// ============================================================================

const ButtonMeta: Meta<typeof Button> = {
  title: 'Design System/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Button component with variants: primary, secondary, ghost. Includes hover states, animations, and accessibility features.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost'],
      description: 'Visual variant of the button'
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size of the button'
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state'
    }
  }
}

export default ButtonMeta
type ButtonStory = StoryObj<typeof Button>

export const Primary: ButtonStory = {
  args: {
    variant: 'primary',
    children: 'Analyze Chart Now'
  }
}

export const Secondary: ButtonStory = {
  args: {
    variant: 'secondary',
    children: 'Export JSON'
  }
}

export const Ghost: ButtonStory = {
  args: {
    variant: 'ghost',
    children: 'Copy Link'
  }
}

export const Disabled: ButtonStory = {
  args: {
    variant: 'primary',
    disabled: true,
    children: 'Loading...'
  }
}

export const AllSizes: ButtonStory = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Button size="sm">Small Button</Button>
      <Button size="md">Medium Button</Button>
      <Button size="lg">Large Button</Button>
    </div>
  )
}

// ============================================================================
// CARD STORIES
// ============================================================================

const CardMeta: Meta<typeof Card> = {
  title: 'Design System/Card',
  component: Card,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Card component with interactive and selected states. Includes hover animations and glow effects.'
      }
    }
  },
  tags: ['autodocs']
}

export { CardMeta as CardDefault }

export const DefaultCard: StoryObj<typeof Card> = {
  render: () => (
    <Card className="w-80">
      <h3 className="text-lg font-semibold text-text-primary mb-2">Card Title</h3>
      <p className="text-sm text-text-secondary">
        This is a default card component with standard styling.
      </p>
    </Card>
  )
}

export const InteractiveCard: StoryObj<typeof Card> = {
  render: () => (
    <Card interactive onClick={() => alert('Card clicked!')} className="w-80">
      <h3 className="text-lg font-semibold text-text-primary mb-2">Interactive Card</h3>
      <p className="text-sm text-text-secondary">
        Hover to see the glow effect. Click to interact.
      </p>
    </Card>
  )
}

export const SelectedCard: StoryObj<typeof Card> = {
  render: () => (
    <Card selected className="w-80">
      <h3 className="text-lg font-semibold text-text-primary mb-2">Selected Card</h3>
      <p className="text-sm text-text-secondary">
        This card is in a selected state with accent border.
      </p>
    </Card>
  )
}

// ============================================================================
// FORM STORIES
// ============================================================================

const InputMeta: Meta<typeof Input> = {
  title: 'Design System/Form/Input',
  component: Input,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Text input with label, error states, and icon support. Includes focus glow effect.'
      }
    }
  },
  tags: ['autodocs']
}

export { InputMeta as InputDefault }

export const TextInput: StoryObj<typeof Input> = {
  args: {
    label: 'Contract Address',
    placeholder: '0x1234...abcd',
    type: 'text'
  }
}

export const InputWithError: StoryObj<typeof Input> = {
  args: {
    label: 'Token Address',
    placeholder: '0x1234...abcd',
    error: 'Invalid address format',
    type: 'text'
  }
}

export const DisabledInput: StoryObj<typeof Input> = {
  args: {
    label: 'Disabled Input',
    placeholder: 'Cannot edit',
    disabled: true,
    type: 'text'
  }
}

// ============================================================================
// SELECT STORIES
// ============================================================================

const SelectMeta: Meta<typeof Select> = {
  title: 'Design System/Form/Select',
  component: Select,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
}

export { SelectMeta as SelectDefault }

export const TimeframeSelect: StoryObj<typeof Select> = {
  args: {
    label: 'Timeframe',
    options: [
      { value: '1m', label: '1 minute' },
      { value: '5m', label: '5 minutes' },
      { value: '15m', label: '15 minutes' },
      { value: '1h', label: '1 hour' },
      { value: '4h', label: '4 hours' },
      { value: '1d', label: '1 day' }
    ]
  }
}

// ============================================================================
// CHECKBOX & TOGGLE STORIES
// ============================================================================

const CheckboxMeta: Meta<typeof Checkbox> = {
  title: 'Design System/Form/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
}

export { CheckboxMeta as CheckboxDefault }

export const CheckboxExample: StoryObj<typeof Checkbox> = {
  args: {
    label: 'Enable notifications'
  }
}

const ToggleMeta: Meta<typeof Toggle> = {
  title: 'Design System/Form/Toggle',
  component: Toggle,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
}

export { ToggleMeta as ToggleDefault }

export const ToggleExample: StoryObj<typeof Toggle> = {
  render: () => {
    const [enabled, setEnabled] = React.useState(false)
    return (
      <div className="flex items-center gap-3">
        <Toggle enabled={enabled} onChange={setEnabled} label="Dark mode" />
        <span className="text-sm text-text-secondary">
          {enabled ? 'Enabled' : 'Disabled'}
        </span>
      </div>
    )
  }
}

// ============================================================================
// STATE STORIES
// ============================================================================

const LoadingMeta: Meta<typeof LoadingSkeleton> = {
  title: 'Design System/States/Loading',
  component: LoadingSkeleton,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
}

export { LoadingMeta as LoadingDefault }

export const LoadingSkeletonExample: StoryObj<typeof LoadingSkeleton> = {
  args: {
    rows: 3
  }
}

const EmptyStateMeta: Meta<typeof EmptyState> = {
  title: 'Design System/States/EmptyState',
  component: EmptyState,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
}

export { EmptyStateMeta as EmptyStateDefault }

export const EmptyStateExample: StoryObj<typeof EmptyState> = {
  render: () => (
    <EmptyState
      icon={<div className="text-6xl">📊</div>}
      title="No Data Available"
      description="Enter a contract address and click 'Analyze' to start technical analysis"
      action={<Button variant="primary">Get Started</Button>}
    />
  )
}

const ErrorStateMeta: Meta<typeof ErrorState> = {
  title: 'Design System/States/ErrorState',
  component: ErrorState,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
}

export { ErrorStateMeta as ErrorStateDefault }

export const ErrorStateExample: StoryObj<typeof ErrorState> = {
  args: {
    title: 'Failed to Load Data',
    message: 'Could not fetch OHLC data from Dexscreener API. Please retry.',
    onRetry: () => alert('Retrying...')
  }
}

// ============================================================================
// BADGE STORIES
// ============================================================================

const BadgeMeta: Meta<typeof Badge> = {
  title: 'Design System/Badge',
  component: Badge,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['success', 'warning', 'error', 'info', 'neutral']
    },
    size: {
      control: 'select',
      options: ['sm', 'md']
    }
  }
}

export { BadgeMeta as BadgeDefault }

export const BadgeSuccess: StoryObj<typeof Badge> = {
  args: {
    variant: 'success',
    children: 'Active'
  }
}

export const BadgeWarning: StoryObj<typeof Badge> = {
  args: {
    variant: 'warning',
    children: 'Pending'
  }
}

export const BadgeError: StoryObj<typeof Badge> = {
  args: {
    variant: 'error',
    children: 'Failed'
  }
}

export const BadgeInfo: StoryObj<typeof Badge> = {
  args: {
    variant: 'info',
    children: 'Beta'
  }
}

export const AllBadges: StoryObj<typeof Badge> = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="success">Active</Badge>
      <Badge variant="warning">Pending</Badge>
      <Badge variant="error">Failed</Badge>
      <Badge variant="info">Beta</Badge>
      <Badge variant="neutral">Draft</Badge>
    </div>
  )
}

// ============================================================================
// MODAL STORIES
// ============================================================================

const ModalMeta: Meta<typeof Modal> = {
  title: 'Design System/Modal',
  component: Modal,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
}

export { ModalMeta as ModalDefault }

export const ModalExample: StoryObj<typeof Modal> = {
  render: () => {
    const [isOpen, setIsOpen] = React.useState(false)
    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Save Trade Idea"
          footer={
            <>
              <Button variant="ghost" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={() => setIsOpen(false)}>
                Save Trade
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <Input label="Entry Price" placeholder="0.000123" />
            <Input label="Target Price" placeholder="0.000150" />
            <Input label="Stop Loss" placeholder="0.000100" />
          </div>
        </Modal>
      </>
    )
  }
}

// ============================================================================
// KPI CARD STORIES
// ============================================================================

const KpiCardMeta: Meta<typeof KpiCard> = {
  title: 'Design System/KpiCard',
  component: KpiCard,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
}

export { KpiCardMeta as KpiCardDefault }

export const KpiCardPositive: StoryObj<typeof KpiCard> = {
  args: {
    label: 'Close (last)',
    value: '0.000123',
    tone: 'positive',
    change: '+12.5%'
  }
}

export const KpiCardNegative: StoryObj<typeof KpiCard> = {
  args: {
    label: 'Change (24h)',
    value: '-3.2%',
    tone: 'negative',
    change: '↓ From 0.000150'
  }
}

export const KpiCardNeutral: StoryObj<typeof KpiCard> = {
  args: {
    label: 'Volume (24h)',
    value: '$1.2M',
    tone: 'neutral'
  }
}

export const KpiCardGrid: StoryObj<typeof KpiCard> = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl">
      <KpiCard label="Close (last)" value="0.000123" tone="neutral" />
      <KpiCard label="Change (24h)" value="+12.5%" tone="positive" change="↑ Bullish" />
      <KpiCard label="Volume" value="$1.2M" tone="neutral" />
      <KpiCard label="ATR(14)" value="0.000015" tone="neutral" />
      <KpiCard label="High/Low Range" value="8.3%" tone="positive" />
      <KpiCard label="RSI(14)" value="62" tone="positive" change="Neutral-Bullish" />
    </div>
  )
}

// ============================================================================
// COLOR PALETTE STORY
// ============================================================================

export const ColorPalette: StoryObj = {
  render: () => (
    <div className="space-y-8 p-6">
      <div>
        <h3 className="text-xl font-bold text-text-primary mb-4">Brand Colors</h3>
        <div className="grid grid-cols-3 gap-4">
          <ColorSwatch color="#FF6200" name="Brand (Orange)" />
          <ColorSwatch color="#00FF66" name="Accent (Green)" />
          <ColorSwatch color="#00E5FF" name="Cyan" />
        </div>
      </div>
      
      <div>
        <h3 className="text-xl font-bold text-text-primary mb-4">Semantic Colors</h3>
        <div className="grid grid-cols-3 gap-4">
          <ColorSwatch color="#10B981" name="Bull (Success)" />
          <ColorSwatch color="#EF4444" name="Bear (Error)" />
          <ColorSwatch color="#F59E0B" name="Warning" />
        </div>
      </div>
      
      <div>
        <h3 className="text-xl font-bold text-text-primary mb-4">Neutrals</h3>
        <div className="grid grid-cols-4 gap-4">
          <ColorSwatch color="#0A0A0A" name="Background" />
          <ColorSwatch color="#121212" name="Surface" />
          <ColorSwatch color="#27272A" name="Border" />
          <ColorSwatch color="#E6EEF2" name="Text Primary" />
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Complete color palette for Sparkfined TA-PWA. All colors are WCAG AA compliant for accessibility.'
      }
    }
  }
}

function ColorSwatch({ color, name }: { color: string; name: string }) {
  return (
    <div className="space-y-2">
      <div
        className="w-full h-20 rounded-lg border border-border shadow-sm"
        style={{ backgroundColor: color }}
      />
      <div>
        <div className="text-sm font-semibold text-text-primary">{name}</div>
        <div className="text-xs font-mono text-text-tertiary">{color}</div>
      </div>
    </div>
  )
}

// ============================================================================
// TYPOGRAPHY STORY
// ============================================================================

export const Typography: StoryObj = {
  render: () => (
    <div className="space-y-8 p-6 max-w-4xl">
      <div>
        <h1 className="text-5xl font-bold text-text-primary mb-2">
          Display Heading (48px)
        </h1>
        <p className="text-sm text-text-tertiary font-mono">font-bold, line-height: 1.15</p>
      </div>
      
      <div>
        <h2 className="text-3xl font-semibold text-text-primary mb-2">
          Heading 2 (36px)
        </h2>
        <p className="text-sm text-text-tertiary font-mono">font-semibold, line-height: 1.2</p>
      </div>
      
      <div>
        <h3 className="text-xl font-semibold text-text-primary mb-2">
          Heading 3 (24px)
        </h3>
        <p className="text-sm text-text-tertiary font-mono">font-semibold, line-height: 1.3</p>
      </div>
      
      <div>
        <p className="text-base text-text-primary mb-2">
          Body text (16px) — Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
          Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </p>
        <p className="text-sm text-text-tertiary font-mono">font-normal, line-height: 1.45</p>
      </div>
      
      <div>
        <p className="text-sm text-text-secondary mb-2">
          Small text (14px) — Used for captions, helper text, and secondary information.
        </p>
        <p className="text-sm text-text-tertiary font-mono">font-normal, line-height: 1.5</p>
      </div>
      
      <div>
        <p className="text-sm font-mono text-text-primary mb-2">
          Monospace (14px) — 0x1234abcd... · $1,234.56 · 0.000123
        </p>
        <p className="text-sm text-text-tertiary font-mono">font-mono, tabular-nums</p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Typography scale for Sparkfined TA-PWA. Responsive sizes adjust for mobile (<768px).'
      }
    }
  }
}

// ============================================================================
// SPACING STORY
// ============================================================================

export const Spacing: StoryObj = {
  render: () => (
    <div className="space-y-6 p-6">
      <h3 className="text-xl font-bold text-text-primary mb-4">8px Grid System</h3>
      <div className="space-y-4">
        {[
          { size: 'xs', value: '4px', class: 'w-1' },
          { size: 'sm', value: '8px', class: 'w-2' },
          { size: 'md', value: '16px', class: 'w-4' },
          { size: 'lg', value: '24px', class: 'w-6' },
          { size: 'xl', value: '32px', class: 'w-8' },
          { size: '2xl', value: '48px', class: 'w-12' },
          { size: '3xl', value: '64px', class: 'w-16' }
        ].map(({ size, value, class: className }) => (
          <div key={size} className="flex items-center gap-4">
            <div className="w-16 text-sm font-mono text-text-tertiary">{size}</div>
            <div className="w-16 text-sm font-mono text-text-tertiary">{value}</div>
            <div className={`${className} h-6 bg-accent rounded`} />
          </div>
        ))}
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Spacing system based on 8px grid for consistent layouts.'
      }
    }
  }
}
