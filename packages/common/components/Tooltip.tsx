import * as RTooltip from '@radix-ui/react-tooltip';
import classNames from 'classnames';
import { useCallback } from 'react';

export function Tooltip({
  children,
  label,
  asChild,
  disabled,
  ignoreNextFocusRef,
}: React.PropsWithChildren<{
  label: string;
  asChild?: boolean;
  disabled?: boolean;
  /**
   * When `.current` is true, the next focus of the trigger does not open the
   * tooltip (the flag resets as it is consumed). Needed when the trigger opens
   * a Radix Dialog: on close the dialog returns focus to the trigger, and the
   * tooltip would open over it and sit there until the next click. Set the
   * flag from the dialog's `onCloseAutoFocus`, which fires just before that
   * refocus.
   */
  ignoreNextFocusRef?: React.MutableRefObject<boolean>;
}>) {
  // Radix only opens on focus when the event is not defaultPrevented, so a
  // preventDefault() here swallows exactly one open (focus events themselves
  // are not cancelable — this has no other effect).
  const handleTriggerFocus = useCallback(
    (event: React.FocusEvent) => {
      if (ignoreNextFocusRef?.current) {
        ignoreNextFocusRef.current = false;
        event.preventDefault();
      }
    },
    [ignoreNextFocusRef],
  );
  return (
    <RTooltip.Provider>
      <RTooltip.Root>
        <RTooltip.Trigger asChild={asChild} className="flex items-center" onFocus={handleTriggerFocus}>
          {children}
        </RTooltip.Trigger>
        <RTooltip.Portal>
          <RTooltip.Content
            sideOffset={5}
            className={classNames(
              'z-10 px-2 py-1 bg-white rounded-md shadow-md dark:bg-qepage-dark text-qetext-light dark:text-qetext-dark dark:shadow-sm dark:shadow-white/20',
              { hidden: disabled }
            )}
          >
            {label}
            <RTooltip.Arrow className="fill-white dark:fill-qepage-dark" />
          </RTooltip.Content>
        </RTooltip.Portal>
      </RTooltip.Root>
    </RTooltip.Provider>
  );
}
