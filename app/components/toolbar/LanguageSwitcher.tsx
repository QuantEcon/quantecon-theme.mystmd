import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useBaseurl, useSiteManifest } from '@myst-theme/providers';
import { useLocation } from '@remix-run/react';
import classNames from 'classnames';
import { Check, Globe } from 'lucide-react';
import type { SiteManifest } from 'myst-config';
import type { TemplateOptions } from '~/types';
import { DEFAULT_SWITCHER_LABEL, languageHref, normaliseLanguages, resolveLabel } from '~/i18n';
import { Tooltip } from './Tooltip';

/**
 * Globe-icon dropdown that switches between the translated editions of a
 * site (Phase 4, #90), the MyST port of the book theme's language switcher.
 * Each entry links to the *same page* in the other edition -- that edition's
 * site root plus this page's path -- and the entry whose code matches
 * `current_language` is marked as the current one.
 *
 * Renders nothing unless `languages` lists two or more editions; a single
 * edition has nothing to switch to.
 *
 * Radix's dropdown supplies the menu semantics and keyboard handling
 * (arrow keys, Escape, focus return), the same as MobileActionsMenu. The
 * items are real anchors (`asChild`), so Enter and a plain click both
 * navigate, and they carry `hreflang` and `lang` for assistive tech.
 */
export function LanguageSwitcher({ size }: { size: number }) {
  const options: TemplateOptions =
    (useSiteManifest() as SiteManifest & TemplateOptions)?.options ?? {};
  const location = useLocation();
  const baseurl = useBaseurl();
  const languages = normaliseLanguages(options.languages);
  if (languages.length < 2) return null;

  const label =
    resolveLabel(undefined, options as Record<string, unknown>, 'language_switcher_label', DEFAULT_SWITCHER_LABEL) ||
    DEFAULT_SWITCHER_LABEL;
  const current = options.current_language?.trim();

  return (
    <DropdownMenu.Root>
      <Tooltip label={label} asChild>
        <DropdownMenu.Trigger
          aria-label={label}
          className="qe-language-switcher flex items-center cursor-pointer"
        >
          <Globe className="opacity-90 hover:scale-110" width={size} height={size} />
        </DropdownMenu.Trigger>
      </Tooltip>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={5}
          className={`
            qe-language-switcher__menu min-w-max rounded-md bg-white
            dark:bg-qepage-dark shadow-md dark:shadow-sm dark:shadow-white/20
            p-2 z-10
            text-qetext-light dark:text-qetext-dark
            will-change-[opacity,transform] data-[side=bottom]:animate-slideUpAndFade data-[side=left]:animate-slideRightAndFade data-[side=right]:animate-slideLeftAndFade data-[side=top]:animate-slideDownAndFade
            `}
        >
          <DropdownMenu.Arrow className="shadow-md stroke-2 fill-white dark:fill-qepage-dark" />
          {languages.map((language) => {
            const active = !!current && language.code === current;
            return (
              <DropdownMenu.Item key={language.code} asChild>
                <a
                  href={languageHref(language, location.pathname, baseurl)}
                  hrefLang={language.code}
                  lang={language.code}
                  aria-current={active ? 'true' : undefined}
                  className={classNames(
                    'flex items-center gap-2 px-2 py-1 rounded outline-none cursor-pointer',
                    'data-[highlighted]:bg-qetoolbar-light dark:data-[highlighted]:bg-qetoolbar-dark',
                    { 'font-semibold': active },
                  )}
                >
                  <span className="grow">{language.name}</span>
                  {active && <Check aria-hidden width={14} height={14} className="shrink-0" />}
                </a>
              </DropdownMenu.Item>
            );
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
