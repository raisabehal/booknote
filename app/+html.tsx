import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

/**
 * Web-only HTML shell (used by the static export). Controls the viewport so the
 * mobile browser behaves:
 *  - `100dvh` sizing so the tab bar isn't hidden behind the browser's bottom UI.
 *  - No auto-zoom on input focus (iOS zooms when an input's font is < 16px) and
 *    no pinch-zoom, which is what was forcing horizontal scrolling.
 *  - Horizontal overflow hidden — there should never be sideways scrolling.
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
        />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: globalCss }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const globalCss = `
html, body, #root { height: 100%; }
/* Use the dynamic viewport height where supported so the bottom tab bar sits
   above the mobile browser chrome instead of being clipped by it. */
@supports (height: 100dvh) { html, body, #root { height: 100dvh; } }
html, body {
  margin: 0;
  background-color: #EEE4D2;
  overflow-x: hidden;
  overscroll-behavior-y: none;
}
/* Inputs at >= 16px stop iOS Safari from auto-zooming (and thus scrolling
   sideways) when they're focused. */
input, textarea, select { font-size: 16px; }
`;
