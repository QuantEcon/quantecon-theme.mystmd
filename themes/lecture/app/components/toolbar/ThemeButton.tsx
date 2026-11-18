import { useThemeSwitcher } from '@myst-theme/providers';
import { Sunset } from 'lucide-react';
import { Tooltip } from '@quantecon/theme-common/components/Tooltip';
import classNames from 'classnames';

export function ThemeButton({ className }: { className?: string }) {
  const { nextTheme } = useThemeSwitcher();
  return (
    <Tooltip label="Change contrast" asChild>
      <button
        className={classNames('flex items-center', className)}
        aria-label="Change contrast"
        onClick={nextTheme}
      >
        <Sunset className="w-5 h-5 hover:scale-110" />
      </button>
    </Tooltip>
  );
}
