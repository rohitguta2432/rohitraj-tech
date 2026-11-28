import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { Asks, Billboards, StreetNext, Who } from '../Sections';
import SixWeeks from '../SixWeeks';
import { projects } from '@/data/projects';
import { agents } from '@/data/agents';

jest.mock('next/link', () => ({
  __esModule: true,
  default: function Link({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) {
    return <a href={href} {...props}>{children}</a>;
  },
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: function Image({ alt }: { alt: string }) {
    return <span role="img" aria-label={alt} />;
  },
}));

// jsdom has no matchMedia; answer as a reduced-motion visitor so nothing animates.
beforeAll(() => {
  window.matchMedia = ((query: string) => ({ matches: true, media: query })) as unknown as typeof window.matchMedia;
});

describe('landing sections', () => {
  it('sends each founder ask to its service page', () => {
    render(<Asks />);
    const hrefs = screen.getAllByRole('link').map((a) => a.getAttribute('href'));
    expect(hrefs).toEqual(expect.arrayContaining([
      '/services/6-week-mvp',
      '/services/forward-deployed-engineer',
      '/services/fractional-ai-engineer',
      '/services/mcp-integration-consultant',
    ]));
  });

  it('links every project and agent from the billboards', () => {
    render(<Billboards />);
    const hrefs = new Set(screen.getAllByRole('link').map((a) => a.getAttribute('href')));
    for (const p of projects) expect(hrefs).toContain(`/projects/${p.slug}`);
    for (const a of agents) expect(hrefs).toContain(a.detailPath ?? `/agents#${a.slug}`);
  });

  it('names a stage for the slider and shows no prices anywhere', () => {
    const { container } = render(
      <>
        <SixWeeks />
        <Asks />
        <Billboards />
        <Who />
        <StreetNext />
      </>,
    );
    expect(screen.getByRole('slider')).toHaveAttribute('aria-valuetext', 'Weeks 2–5: Building in the open');
    expect(container.textContent).not.toMatch(/[$₹€£]\s?\d|\bprice\b|\bpricing\b/i);
  });
});
