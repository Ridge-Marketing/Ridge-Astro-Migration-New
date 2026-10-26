/**
 * HTML parser — replaces custom shortcodes with styled spans
 * Migrated from src/components/global/Parser.js
 */
import { theme } from './theme';

interface TagReplacement {
  tag: string;
  replace: string;
}

const tagList: TagReplacement[] = [
  { tag: '[b]', replace: '<span style="font-weight: 700;">' },
  { tag: '[normal]', replace: '<span style="font-weight: 400;">' },
  { tag: '[font50]', replace: '<span style="font-size: 50px;">' },
  { tag: '[font40]', replace: '<span style="font-size: 40px;" class="leading-H2-H3 block">' },
  { tag: '[temp]', replace: '<span style="font-weight: 600; font-size: 26px;">' },
  { tag: '[extra-slim]', replace: '<span style="max-width: 976px; display:block;">' },
  { tag: '[green]', replace: '<span class="text-rm-green font-semibold">' },
  { tag: '[teal]', replace: '<span class="text-rm-aqua font-semibold">' },
  { tag: '[black]', replace: '<span class="text-rm-black">' },
  { tag: '[lightBlue]', replace: '<span class="text-[#A4FAFF]">' },
  { tag: '[accent]', replace: '<span class="accent-text">' },
  { tag: '[secondary]', replace: '<span class="secondary-text">' },
  { tag: '[white]', replace: '<span class="text-white">' },
  { tag: '[br]', replace: '<br>' },
  { tag: '[i]', replace: '<span style="font-style:italic;">' },
  { tag: '[H1_STD]', replace: `<span style="display:block;" class="${theme.text.H1_STD}">` },
  { tag: '[H1_LTE]', replace: `<span style="display:block;" class="${theme.text.H1_LTE}">` },
  { tag: '[h2]', replace: `<span style="display:block;" class="${theme.text.H2}">` },
  { tag: '[h4]', replace: `<span style="display:block;" class="${theme.text.H4} mb-6 !normal-case">` },
  { tag: '[h4LTE]', replace: `<span style="display:block;" class="${theme.text.H4_LTE} mb-6 !normal-case">` },
  { tag: '[h5]', replace: `<span style="display:block;" class="${theme.text.H5}">` },
  { tag: '[basicSans]', replace: '<span class="font-basic-sans">' },
  { tag: '[SMLTEXT]', replace: '<span class="text-base leading-[1.4375rem] block">' },
  { tag: '[650pxcenter]', replace: '<span class="lg:max-w-[650px] xl:max-w-full mx-auto block">' },
  { tag: '[640px]', replace: '<span class="lg:max-w-[640px] xl:max-w-full block">' },
];

const tagListBlog: TagReplacement[] = [
  { tag: '<hr class="', replace: '<hr class="mt-10 ' },
  { tag: '<br>', replace: ' ' },
  { tag: '[sup]', replace: '<sup>' },
  { tag: '[/sup]', replace: '</sup>' },
];

export function parser(input: string, type: string | null = null): string {
  let output = input || '';
  // Strip any script tags
  output = output.replace(/\s*<script>.*?<\/script>\s*/g, ' ');

  if (type === 'blog') {
    const lines = output.split('\n').filter((n) => n);
    output = lines.join('');
    for (const data of tagListBlog) {
      output = output.replaceAll(data.tag, data.replace);
    }
  } else {
    // Convert bare newlines to <br> (plain text/textarea fields from WP). A
    // newline that already follows a <br> just goes away — otherwise
    // "line one<br/>\r\nline two" turns into a double break.
    output = output.replace(/(<br\s*\/?>)?[ \t]*\r?\n/gi, (_match, br) => br || '<br>');
    // Replace any closing tag: [/word] or [/word-word] with </span>
    output = output.replace(/(\[\/\w+-*\w*\])/g, '</span>');
    for (const data of tagList) {
      output = output.replaceAll(data.tag, data.replace);
    }
  }

  return output;
}

export default parser;
