/**
 * Long code inputs and long outputs: which of a code cell's tags ask for its
 * input or its outputs to be collapsed behind an Expand / Collapse bar, and
 * whether the server can already tell that the content is taller than the cap.
 *
 *   collapse-N          the code input, capped at N + 0.5 em
 *   collapse-output-N   the cell's outputs, capped at N + 0.5 em
 *
 * The heights are the lecture builds': quantecon-book-theme caps a
 * `collapse-N` input at N + 0.5 em of its 18px text, 369px for `collapse-20`.
 * The scroll tags (`scroll-input`, `scroll-output`, `output_scroll`) ask for
 * nothing here: the lectures rename them to `collapse-output-24` when they
 * move to this theme (QuantEcon/project-theme-parity#19).
 *
 * Plain TypeScript with no React, so `node --test` can import it
 * (tests/unit/long-cell.test.mjs).
 */

/** N of `collapse-N` for the input and of `collapse-output-N` for the outputs. */
export type LongCellSpec = { input?: number; output?: number };

const COLLAPSE = /^collapse-(output-)?(\d+)$/;

/**
 * The caps a cell's tags ask for, or `null` when they ask for none. An input
 * and an output cap are independent. Where two tags claim the same side, the
 * first one wins: a cell is authored once and the order is the author's.
 * `collapse-0` and non-numeric heights are ignored rather than collapsing a
 * cell to nothing.
 */
export function longCellSpec(tags: unknown): LongCellSpec | null {
  if (!Array.isArray(tags)) return null;
  const spec: LongCellSpec = {};
  for (const tag of tags) {
    if (typeof tag !== 'string') continue;
    const match = COLLAPSE.exec(tag);
    if (!match) continue;
    const n = Number(match[2]);
    if (!(n > 0)) continue;
    if (match[1]) spec.output ??= n;
    else spec.input ??= n;
  }
  return spec.input || spec.output ? spec : null;
}

/** The cap for N, in em of the collapsed region's text. */
export function capEms(n: number): number {
  return n + 0.5;
}

/**
 * Whether `lines` lines of code or text output are certainly taller than the
 * cap for N. Each such line is at least 1 em of the region tall (a 20px line
 * against its 18px text), so more than N lines overflow N + 0.5 em at any
 * width. Fewer can still overflow once long lines wrap, and an image has no
 * line count at all; the component measures those in the browser.
 */
export function certainlyOverflows(lines: number, n: number): boolean {
  return lines > n;
}

/** The number of lines in a code cell's source. */
export function sourceLines(value: unknown): number {
  return typeof value === 'string' ? countLines(value) : 0;
}

/**
 * The lines of text among a cell's stored outputs (their `jupyter_data`, in
 * nbformat's shape), as a lower bound on their height. An output rendered as
 * an image or as HTML counts nothing, and so does text mystmd stored outside
 * the page, which carries a `path` in place of its `content`.
 */
export function outputTextLines(outputs: unknown[]): number {
  let lines = 0;
  for (const output of outputs) {
    if (!output || typeof output !== 'object') continue;
    const { output_type, text, traceback, data } = output as {
      output_type?: unknown;
      text?: unknown;
      traceback?: unknown;
      data?: unknown;
    };
    if (output_type === 'stream') {
      lines += countLines(textOf(text));
    } else if (output_type === 'error') {
      if (Array.isArray(traceback)) lines += countLines(traceback.join('\n'));
    } else if (data && typeof data === 'object') {
      // execute_result and display_data render their richest type, so only a
      // bundle holding nothing but text/plain renders as text.
      const bundle = data as Record<string, unknown>;
      const types = Object.keys(bundle);
      if (types.length !== 1 || types[0] !== 'text/plain') continue;
      const plain = bundle['text/plain'];
      const content =
        plain && typeof plain === 'object' && !Array.isArray(plain)
          ? (plain as { content?: unknown }).content
          : plain;
      lines += countLines(textOf(content));
    }
  }
  return lines;
}

/** nbformat stores multi-line text as a string or as a list of lines. */
function textOf(value: unknown): string {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.filter((part) => typeof part === 'string').join('');
  return '';
}

function countLines(text: string): number {
  if (!text) return 0;
  return text.replace(/\n$/, '').split('\n').length;
}
