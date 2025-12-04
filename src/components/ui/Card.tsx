/**
 * @deprecated Use `import { Card } from '@/design-system'` instead.
 * Temporary bridge while migrating legacy imports.
 * TODO: design-system: migrate remaining Card imports to '@/design-system' namespace and remove this shim.
 */
export {
  Card as default,
  Card as Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/design-system/components/Card/Card'
export type { CardProps, CardVariant } from '@/design-system/components/Card/Card'
