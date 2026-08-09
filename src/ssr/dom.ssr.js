import { Window } from 'happy-dom'

/**
 * The build-time half of the `@dom` alias (see vite.config.js), swapped in for
 * src/utils/dom.browser.js only in the SSR build — so happy-dom never reaches
 * the browser bundle. Same shape, backed by happy-dom instead of the platform.
 *
 * happy-dom rather than linkedom because the output has to be *byte-identical*
 * to Chrome's: React compares the server's `dangerouslySetInnerHTML` string with
 * the client's character by character. Verified across 24 real articles and FAQ
 * answers, round-tripped and with a link element inserted — 48/48 identical to
 * Chrome. (linkedom returned an empty body for this parse shape.)
 *
 * One Window for the whole build; it holds no per-document state that matters
 * here, and each parseFromString() produces its own document.
 */
const window = new Window()

export function domApi() {
  return { DOMParser: window.DOMParser, SHOW_TEXT: window.NodeFilter.SHOW_TEXT }
}
