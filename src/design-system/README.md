## Sparkfined Design System

Step 1 lays the foundation for the Spark/Void design language.  
This module is intentionally self-contained so future migrations (Step 2+) can
swap legacy UI pieces without touching implementation details again.

### Structure

- `tokens/` – type-safe design tokens (colors, typography, spacing, motion)
- `theme/` – theme objects that compose tokens
- `components/` – core primitives (`Button`, `Card`, `Alert`, `Modal`)
- `utils/` – shared helpers (`cn`, `haptic`)
- `index.ts` – public export barrel

### Usage

```tsx
import { Button, Card, SparkTheme } from '@/design-system'

function ExampleCard() {
  return (
    <Card variant="interactive">
      <Card.Header>
        <Card.Title>XP Progress</Card.Title>
      </Card.Header>
      <Card.Content>
        <Button variant="primary">Continue Journey</Button>
      </Card.Content>
    </Card>
  )
}
```

### Notes

- All colors, spacing, typography and motion values **must** come from tokens.
- Components expose typed variants/sizes so consumers can't drift from spec.
- Framer Motion is included for hover/enter transitions and respects
  `prefers-reduced-motion`.
- Backward compatibility shims in `src/components/ui/` re-export the new
  implementations; do not delete them until migration is complete.
