const mystTheme = require('@myst-theme/styles');

module.exports = {
  darkMode: 'class',
  content: mystTheme.content,
  theme: {
    extend: {
      ...mystTheme.themeExtensions,
      gridTemplateColumns: {
        ...mystTheme.themeExtensions.gridTemplateColumns,
        'simple-sm':
          '[screen-start] 1fr [body-start] minmax(300px, 800px) [body-end] 1fr [screen-end]',
        // Two-column layout at large screens. The empty left track is
        // `minmax(0, 200px)`, not `200px`: the fixed tracks plus the six
        // `subgrid-gap` column gaps need 1328px of viewport, so between the
        // 1280px breakpoint and there the grid outgrew its box -- LTR pages
        // scrolled sideways and the margin column ran off the edge. The
        // spare left track now absorbs that, and from 1328px up the layout
        // is unchanged. Keep in step with CRITICAL_CSS in app/root.tsx.
        'simple-xl':
          '[screen-start] 1fr minmax(0, 200px) 20px [body-start] 800px [body-end] 20px [margin-start] 200px [margin-end] 1fr [screen-end]',
      },
      gridColumn: {
        ...mystTheme.themeExtensions.gridColumn,
        screen: 'screen',
        'screen-start': 'screen-start',
        'screen-end': 'screen-end',
        body: 'body',
        'body-start': 'body-start',
        'body-end': 'body-end',
        margin: 'margin',
        'margin-start': 'margin-start',
        'margin-end': 'margin-end',
        'col-screen': 'screen-start / screen-end',
        'col-body': ' body-start / body-end',
        'col-margin': 'margin-start / margin-end',
        'gutter-left': 'screen-start / body-start',
        'gutter-right': 'margin-end / screen-end',
      },
      colors: {
        'qepage-dark': '#222',
        'qetoolbar-light': '#efefef',
        'qetoolbar-dark': '#444',
        'qetoolbar-border': '#ccc',
        'qetext-light': '#444444',
        'qetext-dark': '#fff',
        'qetext-dark-muted': '#a6a6a6',
        'qeborder-blue': 'rgb(0 114 188)',
      },
      fontFamily: {
        // "Source Sans 3 Variable" is the family name declared by
        // @fontsource-variable/source-sans-3, self-hosted via app/links.ts.
        // Plain "Source Sans 3" comes next so a locally installed copy is used
        // while the webfont swaps in, or if it fails to load.
        //
        // "Source Sans 3 Fallback" is the metric-matched local face declared in
        // CRITICAL_CSS (app/root.tsx). The faces ship `font-display: swap`, so
        // until the woff2 lands the browser paints a fallback and then swaps --
        // and raw Helvetica/Arial run ~7.8% wider than Source Sans 3, which is
        // what makes that swap a visible reflow. The tuned face closes it to
        // ~0.5%. Must stay in step with CRITICAL_CSS in app/root.tsx.
        sans: [
          '"Source Sans 3 Variable"',
          '"Source Sans 3"',
          '"Source Sans 3 Fallback"',
          'sans-serif',
        ],
      },
      keyframes: {
        slideDownAndFade: {
          from: { opacity: '0', transform: 'translateY(-2px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideLeftAndFade: {
          from: { opacity: '0', transform: 'translateX(2px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        slideUpAndFade: {
          from: { opacity: '0', transform: 'translateY(2px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideRightAndFade: {
          from: { opacity: '0', transform: 'translateX(-2px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
      },
      animation: {
        slideDownAndFade: 'slideDownAndFade 400ms cubic-bezier(0.16, 1, 0.3, 1)',
        slideLeftAndFade: 'slideLeftAndFade 400ms cubic-bezier(0.16, 1, 0.3, 1)',
        slideUpAndFade: 'slideUpAndFade 400ms cubic-bezier(0.16, 1, 0.3, 1)',
        slideRightAndFade: 'slideRightAndFade 400ms cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
  safelist: mystTheme.safeList,
};
