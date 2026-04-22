import { cn } from '@/lib/utils/cn';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-slate-700 text-slate-200',
  success: 'bg-emerald-900 text-emerald-300',
  warning: 'bg-amber-900 text-amber-300',
  danger: 'bg-red-900 text-red-300',
  info: 'bg-indigo-900 text-indigo-300',
};

export function Badge({
  variant = 'default',
  children,
  className,
}: BadgeProps): React.JSX.Element {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
