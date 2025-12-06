/**
 * Icon System — Lucide Icons
 * 
 * CRITICAL: Tree-shaking optimized icon exports
 * Uses individual icon imports to minimize bundle size
 * 
 * Usage: import { Search, Bell } from '@/lib/icons';
 * 
 * Bundle Impact: ~2-3 KB per icon vs. 175 KB for barrel import
 */

// Navigation
export { default as Home } from 'lucide-react/dist/esm/icons/home';
export { default as BarChart3 } from 'lucide-react/dist/esm/icons/bar-chart-3';
export { default as FileText } from 'lucide-react/dist/esm/icons/file-text';
export { default as Clock } from 'lucide-react/dist/esm/icons/clock';
export { default as Bell } from 'lucide-react/dist/esm/icons/bell';
export { default as Settings } from 'lucide-react/dist/esm/icons/settings';
export { default as Lock } from 'lucide-react/dist/esm/icons/lock';
export { default as Sparkles } from 'lucide-react/dist/esm/icons/sparkles';

// Actions
export { default as Plus } from 'lucide-react/dist/esm/icons/plus';
export { default as Search } from 'lucide-react/dist/esm/icons/search';
export { default as Download } from 'lucide-react/dist/esm/icons/download';
export { default as Upload } from 'lucide-react/dist/esm/icons/upload';
export { default as Share2 } from 'lucide-react/dist/esm/icons/share-2';
export { default as Copy } from 'lucide-react/dist/esm/icons/copy';
export { default as Edit3 } from 'lucide-react/dist/esm/icons/edit-3';
export { default as Trash2 } from 'lucide-react/dist/esm/icons/trash-2';
export { default as Save } from 'lucide-react/dist/esm/icons/save';

// States
export { default as CheckCircle2 } from 'lucide-react/dist/esm/icons/check-circle-2';
export { default as XCircle } from 'lucide-react/dist/esm/icons/x-circle';
export { default as AlertTriangle } from 'lucide-react/dist/esm/icons/alert-triangle';
export { default as Info } from 'lucide-react/dist/esm/icons/info';
export { default as Loader2 } from 'lucide-react/dist/esm/icons/loader-2';
export { default as Wifi } from 'lucide-react/dist/esm/icons/wifi';
export { default as WifiOff } from 'lucide-react/dist/esm/icons/wifi-off';

// UI
export { default as ChevronDown } from 'lucide-react/dist/esm/icons/chevron-down';
export { default as ChevronRight } from 'lucide-react/dist/esm/icons/chevron-right';
export { default as ChevronUp } from 'lucide-react/dist/esm/icons/chevron-up';
export { default as ChevronLeft } from 'lucide-react/dist/esm/icons/chevron-left';
export { default as X } from 'lucide-react/dist/esm/icons/x';
export { default as Menu } from 'lucide-react/dist/esm/icons/menu';
export { default as MoreVertical } from 'lucide-react/dist/esm/icons/more-vertical';
export { default as MoreHorizontal } from 'lucide-react/dist/esm/icons/more-horizontal';
export { default as Check } from 'lucide-react/dist/esm/icons/check';
export { default as Sun } from 'lucide-react/dist/esm/icons/sun';
export { default as Moon } from 'lucide-react/dist/esm/icons/moon';

// Specific
export { default as TrendingUp } from 'lucide-react/dist/esm/icons/trending-up';
export { default as TrendingDown } from 'lucide-react/dist/esm/icons/trending-down';
export { default as Zap } from 'lucide-react/dist/esm/icons/zap';
export { default as Star } from 'lucide-react/dist/esm/icons/star';
export { default as Shield } from 'lucide-react/dist/esm/icons/shield';
export { default as Users } from 'lucide-react/dist/esm/icons/users';
export { default as FileCheck } from 'lucide-react/dist/esm/icons/file-check';
export { default as MessageCircle } from 'lucide-react/dist/esm/icons/message-circle';
export { default as Activity } from 'lucide-react/dist/esm/icons/activity';
export { default as Eye } from 'lucide-react/dist/esm/icons/eye';
export { default as Mail } from 'lucide-react/dist/esm/icons/mail';
export { default as Webhook } from 'lucide-react/dist/esm/icons/webhook';

// Additional icons (used in various components)
export { default as RotateCw } from 'lucide-react/dist/esm/icons/rotate-cw';
export { default as Circle } from 'lucide-react/dist/esm/icons/circle';
export { default as Lightbulb } from 'lucide-react/dist/esm/icons/lightbulb';
export { default as GraduationCap } from 'lucide-react/dist/esm/icons/graduation-cap';
export { default as Rocket } from 'lucide-react/dist/esm/icons/rocket';
export { default as HelpCircle } from 'lucide-react/dist/esm/icons/help-circle';
export { default as BookOpen } from 'lucide-react/dist/esm/icons/book-open';
export { default as Target } from 'lucide-react/dist/esm/icons/target';
export { default as AlertCircle } from 'lucide-react/dist/esm/icons/alert-circle';
export { default as ArrowRight } from 'lucide-react/dist/esm/icons/arrow-right';
export { default as Filter } from 'lucide-react/dist/esm/icons/filter';
export { default as ArrowDownRight } from 'lucide-react/dist/esm/icons/arrow-down-right';
export { default as ArrowUpRight } from 'lucide-react/dist/esm/icons/arrow-up-right';
export { default as Minus } from 'lucide-react/dist/esm/icons/minus';
export { default as BookmarkPlus } from 'lucide-react/dist/esm/icons/bookmark-plus';
export { default as RefreshCw } from 'lucide-react/dist/esm/icons/refresh-cw';
export { default as ExternalLink } from 'lucide-react/dist/esm/icons/external-link';
export { default as BookmarkSquare } from 'lucide-react/dist/esm/icons/bookmark-square';
export { default as Radio } from 'lucide-react/dist/esm/icons/radio';

// Type export for LucideIcon (used in component props)
export type { LucideIcon } from 'lucide-react';

/**
 * Icon Sizing Convention:
 * - xs: 16px (inline icons, badges)
 * - sm: 20px (buttons, selects)
 * - md: 24px (default, quick actions)
 * - lg: 32px (empty states, headers)
 * - xl: 48px (hero illustrations, onboarding)
 * 
 * Example:
 * <Search size={20} className="text-zinc-400" />
 * <Bell size={24} className="text-emerald-500" />
 */
