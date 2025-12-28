/**
 * Type declarations for lucide-react individual icon imports
 * Enables tree-shaking by importing icons individually
 */

declare module 'lucide-react/dist/esm/icons/*' {
  import { ForwardRefExoticComponent, SVGProps } from 'react';
  
  export interface LucideProps extends Partial<SVGProps<SVGSVGElement>> {
    size?: string | number;
    absoluteStrokeWidth?: boolean;
  }
  
  export type LucideIcon = ForwardRefExoticComponent<LucideProps>;
  
  const Icon: LucideIcon;
  export default Icon;
}
