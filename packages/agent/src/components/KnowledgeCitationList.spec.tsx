import type {
  AgentKnowledgeCitations,
  KnowledgeReceipt,
} from '@genfeedai/contracts/interfaces';
import { render, screen } from '@testing-library/react';
import KnowledgeCitationList from '@ui/knowledge/KnowledgeCitationList';
import { describe, expect, it } from 'vitest';

function receipt(overrides: Partial<KnowledgeReceipt>): KnowledgeReceipt {
  return {
    excerpt: 'We ship every Thursday.',
    kind: 'TEXT',
    purpose: 'BRAND_TRUTH',
    relevance: 0.8,
    sourceId: 'source-1',
    title: 'Brand facts',
    version: 2,
    versionId: 'version-2',
    ...overrides,
  } as KnowledgeReceipt;
}

describe('KnowledgeCitationList', () => {
  it('lists each cited source under its marker, in marker order', () => {
    const citations: AgentKnowledgeCitations = {
      citations: [
        {
          marker: 2,
          receipt: receipt({
            title: 'Pricing page',
            url: 'https://example.com/pricing',
            versionId: 'version-9',
          }),
        },
        { marker: 1, receipt: receipt({}) },
      ],
      unsupportedCount: 0,
    };

    render(<KnowledgeCitationList citations={citations} />);

    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent('[1]');
    expect(items[0]).toHaveTextContent('Brand facts');
    expect(items[0]).toHaveTextContent('Version 2');
    expect(items[0]).toHaveTextContent('We ship every Thursday.');
    expect(items[1]).toHaveTextContent('[2]');
    expect(screen.getByRole('link', { name: 'Pricing page' })).toHaveAttribute(
      'href',
      'https://example.com/pricing',
    );
    expect(
      screen.queryByTestId('knowledge-citations-unsupported'),
    ).not.toBeInTheDocument();
  });

  it('says when citations were removed because they could not be verified', () => {
    render(
      <KnowledgeCitationList
        citations={{ citations: [], unsupportedCount: 2 }}
      />,
    );

    expect(
      screen.getByTestId('knowledge-citations-unsupported'),
    ).toHaveTextContent('2 citations could not be verified and were removed.');
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
  });

  it('renders nothing when there is nothing to show', () => {
    const { container } = render(
      <KnowledgeCitationList
        citations={{ citations: [], unsupportedCount: 0 }}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
