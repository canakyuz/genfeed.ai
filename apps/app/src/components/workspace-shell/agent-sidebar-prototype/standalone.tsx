import { ButtonSize, ButtonVariant } from '@genfeedai/contracts';
import { Button } from '@ui/primitives/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@ui/primitives/dropdown-menu';
import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import AgentSidebarPrototype, {
  type PrototypeAsset,
} from './AgentSidebarPrototype';

const FIXTURES: readonly PrototypeAsset[] = [
  {
    recordId: 'prototype-video',
    kind: 'asset',
    label: 'Crafting the story',
    media: 'video',
  },
  {
    recordId: 'prototype-image',
    kind: 'asset',
    label: 'The finished piece',
    media: 'image',
  },
];
function StandalonePreview() {
  const [scenario, setScenario] = useState('One video');
  const [theme, setTheme] = useState(
    document.documentElement.dataset.theme ?? 'dark',
  );
  const selection =
    scenario === 'No selection'
      ? []
      : scenario === 'One video'
        ? FIXTURES.slice(0, 1)
        : FIXTURES;
  return (
    <main className="mx-auto w-full max-w-[420px] py-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-muted-foreground">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size={ButtonSize.SM}
              variant={ButtonVariant.GHOST}
              withWrapper={false}
            >
              Scenario: {scenario}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>Prototype scenario</DropdownMenuLabel>
            <DropdownMenuRadioGroup
              value={scenario}
              onValueChange={setScenario}
            >
              {['No selection', 'One video', 'Two assets'].map((value) => (
                <DropdownMenuRadioItem key={value} value={value}>
                  {value}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          variant={ButtonVariant.GHOST}
          size={ButtonSize.SM}
          withWrapper={false}
          onClick={() => {
            const next = theme === 'dark' ? 'light' : 'dark';
            document.documentElement.dataset.theme = next;
            document.documentElement.style.colorScheme = next;
            setTheme(next);
          }}
        >
          {theme === 'dark' ? 'Light' : 'Dark'} theme
        </Button>
      </div>
      <div
        className="h-[740px] overflow-hidden rounded-lg border border-border"
        data-testid="standalone-sidebar-frame"
      >
        <AgentSidebarPrototype selection={selection} />
      </div>
      <p className="mt-3 px-1 text-xs text-muted-foreground">
        Throwaway prototype · simulated responses · no changes saved
      </p>
    </main>
  );
}
const mount = document.getElementById('agent-sidebar-root');
if (mount) createRoot(mount).render(<StandalonePreview />);
