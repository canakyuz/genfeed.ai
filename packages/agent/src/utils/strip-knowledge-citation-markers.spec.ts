import { stripKnowledgeCitationMarkers } from '@genfeedai/agent/utils/strip-knowledge-citation-markers';
import { describe, expect, it } from 'vitest';

describe('stripKnowledgeCitationMarkers', () => {
  it('removes complete markers together with the space before them', () => {
    expect(
      stripKnowledgeCitationMarkers(
        'We ship every Thursday [[cite:p1]] and price from $29 [[cite:p2]].',
      ),
    ).toBe('We ship every Thursday and price from $29.');
  });

  it.each([
    ['a marker cut after the brackets', 'We ship on Thursday [['],
    ['a marker cut mid-keyword', 'We ship on Thursday [[ci'],
    ['a marker cut mid-id', 'We ship on Thursday [[cite:p'],
    ['a marker missing one bracket', 'We ship on Thursday [[cite:p1]'],
  ])('hides %s at the end of the stream', (_label, text) => {
    expect(stripKnowledgeCitationMarkers(text)).toBe('We ship on Thursday');
  });

  it('leaves ordinary brackets and resolved [n] markers alone', () => {
    const text = 'Use arr[0] and see [1] and [[link]] for details.';
    expect(stripKnowledgeCitationMarkers(text)).toBe(text);
  });
});
