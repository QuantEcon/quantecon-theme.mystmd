import { useGridSystemProvider } from '@myst-theme/providers';
import { MyST } from 'myst-to-react';
import classNames from 'classnames';
import type { GenericParent } from 'myst-common';

const LICENSE_URL = 'https://creativecommons.org/licenses/by-sa/4.0/';

/**
 * The CC BY-SA 4.0 button, drawn inline rather than loaded.
 *
 * The lecture builds hot-link `licensebuttons.net/l/by-sa/4.0/80x15.png`, which
 * makes every page wait on a third-party host; a bundled file would need a
 * root-absolute `/` path, which 404s wherever a site is served under a
 * sub-path. Inline markup has neither problem.
 *
 * The geometry and colours are the 80x15 button's own, measured from it: a
 * black field with a 1px white inset, a #abb1aa cell holding the roundel, and
 * the wordmark on black. The lettering is text rather than traced outlines, so
 * `textLength` pins each string's width and the badge holds its proportions
 * whichever font the reader's system resolves.
 *
 * `inline` is carried on the element rather than set from a footer rule:
 * Preflight makes every `svg` a block, and a footer-wide selector would also
 * catch the external-link icon myst-to-react hangs off a link in a site's own
 * footer.md, which has no intrinsic size and grows to fill the column.
 */
function LicenseBadge() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="80"
      height="15"
      viewBox="0 0 80 15"
      role="img"
      className="inline"
    >
      <title>Creative Commons License</title>
      <rect width="80" height="15" fill="#000000" />
      <rect x="1" y="1" width="78" height="13" fill="#ffffff" />
      <rect x="2" y="2" width="21" height="11" fill="#abb1aa" />
      <rect x="23" y="2" width="55" height="11" fill="#000000" />
      <ellipse cx="13" cy="7.5" rx="6.5" ry="5" fill="#ffffff" stroke="#000000" strokeWidth="1" />
      <g
        fontFamily="Helvetica, Arial, sans-serif"
        fontWeight="bold"
        textAnchor="middle"
        lengthAdjust="spacingAndGlyphs"
      >
        <text x="13" y="10" fontSize="7" textLength="8" fill="#000000">
          cc
        </text>
        {/* Centred on the cell's text block, not the cell: the button carries
            its trailing black as padding. */}
        <text x="41" y="10.3" fontSize="7.5" textLength="25" fill="#ffffff">
          BY-SA
        </text>
      </g>
    </svg>
  );
}

/**
 * Shown when a site declares no `site.parts.footer`.
 *
 * The lecture builds write the licence and credit straight into the page with
 * no condition around them, so every site carries them without configuring
 * anything. Rendering them here keeps that true after the move: a site states
 * other terms by supplying the part, which replaces this whole block.
 *
 * The wording is fixed English, so the sentence carries `dir="ltr"`: in a
 * right-to-left edition its closing full stop is a neutral character at the end
 * of the run, and the paragraph's direction would otherwise place it at the
 * line's left edge. The span keeps the sentence itself right-aligned with the
 * rest of the page.
 */
function DefaultFooterContent() {
  return (
    <div className="col-body">
      <p>
        <a href={LICENSE_URL} rel="license">
          <LicenseBadge />
        </a>
      </p>
      <p>
        <span dir="ltr">
          Creative Commons License – This work is licensed under a Creative Commons
          Attribution-ShareAlike 4.0 International.
        </span>
      </p>
      <p>
        A theme by <a href="https://quantecon.org">QuantEcon</a>
      </p>
    </div>
  );
}

export function SiteFooter({ content, className }: { content?: GenericParent; className?: string }) {
  const grid = useGridSystemProvider();
  return (
    <div
      className={classNames(
        'qe-site-footer col-screen subgrid-gap',
        grid
      )}
    >
      <div className="border-t-[5px] border-t-qeborder-blue col-body mb-5" />
      {/* col-body, not col-screen: the footer text keeps to the content column,
          the same width as the 5px rule above -- col-screen would run the text
          wider than its own rule. */}
      {content ? <MyST ast={content} className="col-body" /> : <DefaultFooterContent />}
    </div>
  );
}
