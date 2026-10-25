'use client';

import { ButtonSize, ButtonVariant } from '@genfeedai/contracts';
import type { AgentArtifactReference } from '@genfeedai/contracts/interfaces/ai/agent-artifact-reference.interface';
import Card from '@ui/card/Card';
import { Button } from '@ui/primitives/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@ui/primitives/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@ui/primitives/tabs';
import { Textarea } from '@ui/primitives/textarea';
import PromptBarComposer from '@ui/prompt-bars/components/shell/PromptBarComposer';
import PromptBarSendButton from '@ui/prompt-bars/components/toolbar/PromptBarSendButton';
import PromptBarToolbar from '@ui/prompt-bars/components/toolbar/PromptBarToolbar';
import { useState } from 'react';

export type PrototypeAsset = Pick<
  AgentArtifactReference,
  'recordId' | 'kind'
> & { label: string; media: 'image' | 'video' | 'unknown' };
export type AgentSidebarPrototypeProps = {
  selection?: readonly PrototypeAsset[];
  onClose?: () => void;
  onOpenFullPage?: () => void;
};
type PrototypeAction = readonly [string, string];
type Message = {
  id: string;
  role: 'You' | 'Agent';
  text: string;
  context: string;
};
const EMPTY_SELECTION: readonly PrototypeAsset[] = [];

/** Throwaway: real shared controls, one header, simulated actions only. */
export default function AgentSidebarPrototype({
  selection = EMPTY_SELECTION,
  onClose,
  onOpenFullPage,
}: AgentSidebarPrototypeProps) {
  const [tab, setTab] = useState('chat');
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [mode, setMode] = useState('Auto');
  const [includeSelection, setIncludeSelection] = useState(true);
  const [closed, setClosed] = useState(false);
  const [notice, setNotice] = useState('');
  const picked = includeSelection ? selection : EMPTY_SELECTION;
  const context = picked.length
    ? picked.map((item) => item.label).join(', ')
    : 'Library · All assets';
  const actions: readonly PrototypeAction[] =
    picked.length > 1
      ? [
          ['Compare assets', 'Find what works together'],
          ['Create a carousel', 'Build a story from this set'],
          ['Draft posts', 'Use your selected assets'],
          ['Organize selection', 'Group these assets'],
        ]
      : picked[0]?.media === 'video'
        ? [
            ['Write a caption', 'For this video'],
            ['Create clips', 'Find moments to reuse'],
            ['Draft a post', 'Start from this video'],
            ['Review video', 'Get a second opinion'],
          ]
        : picked.length
          ? [
              ['Write a caption', 'For your selection'],
              ['Draft a post', 'Start from this asset'],
              ['Review asset', 'Get a second opinion'],
              ['Organize asset', 'Add it to a collection'],
            ]
          : [
              ['Find an asset', 'Search your library'],
              ['Organize library', 'Bring related assets together'],
              ['Draft a post', 'Start with your brand'],
              ['Review recent assets', 'Choose what to use next'],
            ];
  function send(text: string) {
    if (!text.trim()) return;
    const response =
      mode === 'Plan'
        ? `Here’s the plan:\n1. Review ${context}.\n2. ${text}.\n3. Review the result before applying it.`
        : `I’ll use ${context} to ${text.charAt(0).toLowerCase()}${text.slice(1)}. This prototype simulates the response; no changes are saved.`;
    setMessages((current) => [
      ...current,
      { id: crypto.randomUUID(), role: 'You', text, context },
      { id: crypto.randomUUID(), role: 'Agent', text: response, context: '' },
    ]);
    setDraft('');
    setTab('chat');
    setNotice('');
  }
  function newChat() {
    setMessages([]);
    setDraft('');
    setTab('chat');
    setNotice('');
  }
  if (closed)
    return (
      <div className="flex h-full items-center justify-center">
        <Button onClick={() => setClosed(false)} size={ButtonSize.SM}>
          Open agent
        </Button>
      </div>
    );
  return (
    <Tabs
      value={tab}
      onValueChange={setTab}
      className="flex h-full min-h-0 flex-col bg-card text-card-foreground"
      data-testid="agent-sidebar-prototype"
    >
      <header
        className="flex h-12 shrink-0 items-center gap-1 border-b border-border px-2"
        data-testid="agent-prototype-header"
      >
        <TabsList aria-label="Agent views" className="min-w-0">
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="context">Context</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        <div className="ml-auto flex shrink-0 items-center gap-0.5">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant={ButtonVariant.GHOST}
                size={ButtonSize.SM}
                withWrapper={false}
              >
                More
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={newChat}>New chat</DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() =>
                  onOpenFullPage
                    ? onOpenFullPage()
                    : setNotice(
                        'The full-page agent stays unchanged. This preview only shows the sidebar.',
                      )
                }
              >
                Open full-page agent
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Response mode</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={mode} onValueChange={setMode}>
                <DropdownMenuRadioItem value="Auto">Auto</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="Plan">Plan</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
              {draft.trim() ? (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={() =>
                      setDraft(
                        `Using ${context}, ${draft} Keep it concise and match the brand voice.`,
                      )
                    }
                  >
                    Improve this prompt
                  </DropdownMenuItem>
                </>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant={ButtonVariant.GHOST}
            size={ButtonSize.SM}
            withWrapper={false}
            onClick={() => (onClose ? onClose() : setClosed(true))}
          >
            Close
          </Button>
        </div>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5">
        <TabsContent value="chat" className="m-0">
          {messages.length ? (
            <div className="space-y-5">
              {messages.map((message) =>
                message.role === 'You' ? (
                  <Card key={message.id} bodyClassName="gap-2 p-3">
                    <p className="whitespace-pre-wrap text-sm">
                      {message.text}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Used: {message.context}
                    </p>
                  </Card>
                ) : (
                  <div key={message.id} className="space-y-2">
                    <p className="text-xs font-medium">Agent</p>
                    <p className="whitespace-pre-wrap text-sm leading-6">
                      {message.text}
                    </p>
                  </div>
                ),
              )}
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <p className="mb-2 text-xs text-muted-foreground">
                  {picked.length
                    ? `${picked.length} ${picked.length === 1 ? 'asset' : 'assets'} selected`
                    : 'Your library'}
                </p>
                <h2 className="text-lg font-semibold">
                  {picked.length > 1
                    ? 'Work with your selection.'
                    : picked[0]?.media === 'video'
                      ? 'Work with this video.'
                      : picked.length
                        ? 'Work with this asset.'
                        : 'What’s next?'}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Start with an action or ask in your own words.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {actions.map(([title, description]) => (
                  <Card
                    key={title}
                    label={title}
                    description={description}
                    onClick={() => send(title)}
                    className="min-h-28"
                    bodyClassName="h-full p-3"
                  />
                ))}
              </div>
            </div>
          )}
        </TabsContent>
        <TabsContent value="context" className="m-0 space-y-5">
          <div>
            <h2 className="text-base font-semibold">What the agent can see</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              The page you’re on and your selected assets.
            </p>
          </div>
          <section>
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              CURRENT PAGE
            </p>
            <p className="text-sm">Library / All assets</p>
            <p className="mt-1 text-xs text-muted-foreground">Included</p>
          </section>
          <section>
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              SELECTION · {selection.length}
            </p>
            {selection.length ? (
              <>
                <div className="space-y-3">
                  {selection.map((item) => (
                    <div key={item.recordId}>
                      <p className="text-sm">{item.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.media === 'unknown'
                          ? 'Asset'
                          : item.media === 'video'
                            ? 'Video'
                            : 'Image'}{' '}
                        · {includeSelection ? 'Included' : 'Excluded'}
                      </p>
                    </div>
                  ))}
                </div>
                <Button
                  variant={ButtonVariant.GHOST}
                  size={ButtonSize.SM}
                  className="mt-3"
                  withWrapper={false}
                  onClick={() => setIncludeSelection((value) => !value)}
                >
                  {includeSelection ? 'Use page only' : 'Include selection'}
                </Button>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Select an asset in the Library to include it here.
              </p>
            )}
          </section>
        </TabsContent>
        <TabsContent value="history" className="m-0 space-y-4">
          <h2 className="text-base font-semibold">Your conversations</h2>
          {messages.length ? (
            <Card
              label="Current conversation"
              description="Continue your current chat"
              onClick={() => setTab('chat')}
              bodyClassName="p-3"
            />
          ) : null}
          {['Launch week posts', 'Organize product assets'].map((title) => (
            <Card
              key={title}
              label={title}
              description={
                title === 'Launch week posts'
                  ? '3 drafts · Today'
                  : 'Library cleanup · Yesterday'
              }
              onClick={() => {
                setMessages([
                  {
                    id: crypto.randomUUID(),
                    role: 'You',
                    text: title,
                    context: 'Library · All assets',
                  },
                  {
                    id: crypto.randomUUID(),
                    role: 'Agent',
                    text: 'This is a simulated conversation. Continue here or start a new chat from More.',
                    context: '',
                  },
                ]);
                setTab('chat');
              }}
              bodyClassName="p-3"
            />
          ))}
        </TabsContent>
      </div>
      <div className="shrink-0 space-y-2 p-3">
        {notice ? (
          <p role="status" className="text-xs text-muted-foreground">
            {notice}
          </p>
        ) : null}
        <p
          className="truncate px-1 text-xs text-muted-foreground"
          aria-live="polite"
        >
          Using: {context}
          {mode === 'Plan' ? ' · Plan mode' : ''}
        </p>
        <PromptBarComposer density="compact">
          <Textarea
            aria-label="Message the agent"
            placeholder={
              picked.length
                ? 'Ask about your selection…'
                : 'Ask about your library…'
            }
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                send(draft);
              }
            }}
            rows={2}
            className="min-h-20 resize-none rounded-none border-0 bg-transparent p-0 focus-visible:border-0"
          />
          <PromptBarToolbar
            leading={
              <Button
                variant={ButtonVariant.GHOST}
                size={ButtonSize.SM}
                withWrapper={false}
                onClick={() => {
                  setTab('context');
                  setNotice(
                    'Select assets in the Library to attach them to your next message.',
                  );
                }}
              >
                Attach
              </Button>
            }
            trailing={
              <PromptBarSendButton
                ariaLabel="Send message"
                isDisabled={!draft.trim()}
                onClick={() => send(draft)}
              />
            }
          />
        </PromptBarComposer>
      </div>
    </Tabs>
  );
}
