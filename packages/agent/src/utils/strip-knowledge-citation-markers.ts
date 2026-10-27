const COMPLETE_MARKER = /\s?\[\[cite:[A-Za-z0-9_-]{0,128}\]\]/g;
/** A marker still being streamed: `[`, `[[ci`, `[[cite:p`, `[[cite:p1]`. */
const PARTIAL_TAIL =
  /\s?\[(?:\[(?:c(?:i(?:t(?:e(?::[A-Za-z0-9_-]*\]?)?)?)?)?)?)?$/;

/**
 * Streamed text carries the model's raw `[[cite:<passageId>]]` markers until
 * the server resolves them at the end of the turn. Hide them (and a marker cut
 * off mid-stream) so the reader never sees ids that may turn out invalid.
 */
export function stripKnowledgeCitationMarkers(text: string): string {
  return text.replace(COMPLETE_MARKER, '').replace(PARTIAL_TAIL, '');
}
