import React from 'react';
import { cn } from '../../utils/cn';

const variantStyles = {
  primary:
    'bg-primary-600 text-white border border-transparent shadow-sm shadow-primary-500/20 hover:bg-primary-500 active:bg-primary-700',
  secondary:
    'bg-slate-950/80 text-white border border-slate-700 hover:bg-slate-900 active:bg-slate-800',
  tertiary:
    'bg-transparent text-slate-300 border border-slate-700/60 hover:bg-slate-900/60 active:bg-slate-800',
};

const ActionButton = ({
  children,
  icon: Icon,
  variant = 'primary',
  className,
  disabled,
  ...props
}) => {
  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500/30 disabled:pointer-events-none disabled:opacity-60',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {Icon ? <Icon className="h-4 w-4" /> : null}
      <span>{children}</span>
    </button>
  );
};

export default ActionButton;
