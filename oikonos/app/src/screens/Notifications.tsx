import { useNotices, useActions } from '../data/store';
import { useNav, type Route } from '../nav';
import {
  Screen, TopBar, PageHead, Stack, Rise, Empty, Rule, Button,
} from '../components/ui';
import { IcBolt, IcCoin, IcFlag, IcSpark, IcLeaf } from '../components/icons';
import type { Notice, NoticeKind } from '../data/types';
import { relativeDay, time } from '../lib/format';
import { useApp } from '../data/store';
import { motion } from 'framer-motion';
import { snap } from '../lib/motion';
import { useMemo } from 'react';
import './Notifications.css';

const KIND: Record<NoticeKind, { icon: React.ReactNode; ink: string; label: string }> = {
  budget:   { icon: <IcCoin size={17} />,  ink: 'vermilion', label: 'Budget' },
  bill:     { icon: <IcBolt size={17} />,  ink: 'vermilion', label: 'Bill' },
  goal:     { icon: <IcFlag size={17} />,  ink: 'olive',     label: 'Goal' },
  insight:  { icon: <IcSpark size={17} />, ink: 'ink',       label: 'Insight' },
  security: { icon: <IcLeaf size={17} />,  ink: 'olive',     label: 'Security' },
};

export function Notifications() {
  const { back, push } = useNav();
  const { rows, unread } = useNotices();
  const { readNotice, readAllNotices } = useActions();
  const { now } = useApp();
  const nowDate = useMemo(() => new Date(now), [now]);

  function open(n: Notice) {
    readNotice(n.id);
    if (!n.route) return;
    push(
      (n.routeId
        ? { name: n.route, id: n.routeId }
        : { name: n.route }) as Route,
    );
  }

  return (
    <Screen>
      <TopBar onBack={back} />
      <div className="pane pane--pad scroll-y note__scroll">
        <Stack gap={0}>
          <Rise>
            <PageHead
              eyebrow="Account"
              title="What’s new"
              sub={unread > 0 ? `${unread} unread` : 'All caught up'}
              right={unread > 0 ? (
                <Button variant="ghost" ink="ink" onClick={readAllNotices}>
                  Mark all read
                </Button>
              ) : undefined}
            />
          </Rise>

          {rows.length === 0 ? (
            <Rise>
              <Empty title="Nothing to report"
                body="Oikonos only speaks up when there is something you can act on." />
            </Rise>
          ) : rows.map((n, i) => {
            const k = KIND[n.kind];
            return (
              <Rise key={n.id}>
                <motion.button
                  className={`note ${n.read ? 'note--read' : ''}`}
                  onClick={() => open(n)}
                  whileTap={{ scale: 0.99 }}
                  transition={snap}
                >
                  <span className="note__icon tex-ink" style={{ background: `var(--${k.ink})` }}>
                    {k.icon}
                  </span>
                  <span className="note__body">
                    <span className="note__meta">
                      {k.label}
                      <span className="note__when">
                        {relativeDay(n.at, nowDate)} · {time(n.at)}
                      </span>
                    </span>
                    <span className="note__title">{n.title}</span>
                    <span className="note__text">{n.body}</span>
                  </span>
                  {!n.read && <span className="note__dot" aria-label="Unread" />}
                </motion.button>
                {i < rows.length - 1 && <Rule inset={54} />}
              </Rise>
            );
          })}
        </Stack>
      </div>
    </Screen>
  );
}
