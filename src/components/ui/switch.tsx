import * as React from 'react';
import { cn } from '../../lib/utils';

export interface SwitchProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  onCheckedChange?: (checked: boolean) => void;
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, onCheckedChange, onChange, ...props }, ref) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(event);
      onCheckedChange?.(event.target.checked);
    };

    return (
      <label className={cn('relative inline-flex cursor-pointer items-center', className)}>
        <input
          type="checkbox"
          className="sr-only peer"
          ref={ref}
          onChange={handleChange}
          {...props}
        />
        <div className="peer h-6 w-11 rounded-full bg-muted ring-2 ring-transparent transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 peer-checked:bg-primary">
          <div className="h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-all peer-checked:translate-x-5 peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-disabled:cursor-not-allowed peer-disabled:opacity-50">
          </div>
        </div>
      </label>
    );
  }
);
Switch.displayName = 'Switch';

export { Switch };
