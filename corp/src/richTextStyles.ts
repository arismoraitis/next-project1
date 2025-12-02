export const RICH_TEXT_CLASSES = `
  text-slate-200 break-words space-y-2

  /* Lists */
  [&_ul]:list-disc [&_ul]:ml-6
  [&_ol]:list-decimal [&_ol]:ml-6
  [&_li]:mt-1

  /* Headings */
  [&_h1]:text-xl [&_h1]:font-semibold
  [&_h2]:text-lg [&_h2]:font-semibold
  [&_h3]:text-base [&_h3]:font-semibold

  /* Inline text */
  [&_strong]:font-semibold
  [&_u]:underline
  [&_em]:italic

  /* Images */
  [&_img]:mt-3 [&_img]:max-h-80 [&_img]:w-full 
  [&_img]:object-cover [&_img]:rounded-xl
`;
