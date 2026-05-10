// NO "use client" — RSC; emits a literal HTML comment into <head>
// (DEV-02). React/JSX strips literal <!-- ... --> in source. The workaround:
// emit via dangerouslySetInnerHTML on a host element that React lets us inject
// raw HTML into. <noscript>'s contents are inert and pass through to view-source
// unchanged across Chrome/Firefox/Safari.
//
// Tone: all-lowercase letter — distinct from the on-screen ASCII art console
// signature. The tonal contrast is the easter egg's character (D-27).

const HEAD_COMMENT = `<!--
  hello, you found the source.
  i build with: typescript, react, nextjs, swift, aws.
  open to: senior engineering roles, ai/agentic systems, mobile.
  reach: beckprograms@gmail.com
  github: beckinfonet
  thanks for looking. — bakytbek
-->`;

export function HeadComment() {
  return <noscript dangerouslySetInnerHTML={{ __html: HEAD_COMMENT }} />;
}
