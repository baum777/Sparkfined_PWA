import { withTokenLockOrMock } from './withTokenLockOrMock';

const ESTIMATED_TOKENS = 120;
const MAX_OUTPUT_TOKENS = 180;

export const deterministicNotes = (thesis: string, tags: string[]): string => {
  const normalizedTags = tags.length ? tags.join(', ') : 'no tags captured';
  const thesisExcerpt = thesis.trim().length ? thesis.trim().slice(0, 160) : 'No thesis text provided.';

  return [
    'AI Notes (mocked)',
    `Tags observed: ${normalizedTags}.`,
    `Thesis summary: ${thesisExcerpt}${thesis.length > 160 ? '…' : ''}`,
    'Next steps: validate risk, confirm invalidate criteria, and journal outcome after execution.',
  ].join('\n');
};

export const generateJournalNotes = async ({
  thesis,
  tags,
  now,
}: {
  thesis: string;
  tags: string[];
  now?: Date;
}) => {
  return withTokenLockOrMock<string>({
    kind: 'journal.notes',
    estimatedTokens: ESTIMATED_TOKENS,
    maxOutputTokens: MAX_OUTPUT_TOKENS,
    now,
    doRealCall: async ({ maxOutputTokens }) => {
      const result = deterministicNotes(thesis, tags);
      return {
        result,
        tokensUsed: Math.min(ESTIMATED_TOKENS, maxOutputTokens),
      };
    },
    mockResult: () => deterministicNotes(thesis, tags),
  });
};
