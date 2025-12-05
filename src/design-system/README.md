# Sparkfined Design System

Codex Step 1 establishes the new design system foundation without migrating existing surfaces. This directory contains:

- **tokens** – TypeScript design tokens (colors, typography, spacing, shadows, animation)
- **theme** – Spark theme bundle
- **components** – Spec-compliant Button, Card, Alert, Modal implementations with unit tests
- **utils** – Shared helpers (`cn`, `triggerHaptic`)

Usage example:

```tsx
import { Button, Card, sparkTheme } from '@/design-system'

export function Demo() {
  return (
    <Card variant="glow">
      <CardHeader>
        <CardTitle>New Position</CardTitle>
      </CardHeader>
      <Button variant="primary">Execute trade</Button>
    </Card>
  )
}
```

Consumers should import from `@/design-system` or the temporary shims under `src/components/ui/*`. Step 2+ will gradually migrate existing screens to these components.
