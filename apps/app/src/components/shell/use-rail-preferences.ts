'use client';

import {
  isNativeSecondaryAppId,
  normalizeRailAppOrder,
} from '@genfeedai/contracts/constants';
import { useAuthedService } from '@hooks/auth/use-authed-service/use-authed-service';
import { UsersService } from '@services/organization/users.service';
import { useCallback, useEffect, useRef, useState } from 'react';

type RailPreferenceField = 'pinnedAppIds' | 'railAppOrder';

type RailPreferenceLists = Record<RailPreferenceField, string[]>;

type IdListUpdate = (ids: string[]) => string[];

const FIELDS: readonly RailPreferenceField[] = ['pinnedAppIds', 'railAppOrder'];

const NORMALIZERS: Record<
  RailPreferenceField,
  (ids: readonly string[] | undefined) => string[]
> = {
  pinnedAppIds: (ids) => [
    ...new Set((ids ?? []).filter(isNativeSecondaryAppId)),
  ],
  railAppOrder: normalizeRailAppOrder,
};

function emptyLists(): RailPreferenceLists {
  return { pinnedAppIds: [], railAppOrder: [] };
}

function toggledIds(ids: readonly string[], appId: string): string[] {
  return ids.includes(appId)
    ? ids.filter((id) => id !== appId)
    : [...ids, appId];
}

/**
 * The signed-in user's rail preferences: which secondary apps are pinned and
 * the order of the rail. Both live on their settings row and share one read.
 */
export function useRailPreferences() {
  const getUsers = useAuthedService((token) => UsersService.getInstance(token));
  const [lists, setLists] = useState<RailPreferenceLists>(emptyLists);
  const editRef = useRef<
    (field: RailPreferenceField, update: IdListUpdate) => void
  >(() => {});

  useEffect(() => {
    const controller = new AbortController();
    let desired = emptyLists();
    let confirmed = emptyLists();
    const revision: Record<RailPreferenceField, number> = {
      pinnedAppIds: 0,
      railAppOrder: 0,
    };
    const dirty = new Set<RailPreferenceField>();
    let isReady = false;
    let isSaving = false;
    const queuedEdits: { field: RailPreferenceField; update: IdListUpdate }[] =
      [];
    setLists(emptyLists());

    const publish = () => setLists({ ...desired });

    // One write at a time prevents the server from storing out-of-order lists.
    // Responses from earlier revisions never replace a newer optimistic edit.
    const save = async () => {
      if (!isReady || isSaving || controller.signal.aborted) return;
      isSaving = true;
      try {
        while (!controller.signal.aborted) {
          const field = FIELDS.find((candidate) => dirty.has(candidate));
          if (!field) return;
          const submittedRevision = revision[field];
          const next = [...desired[field]];
          try {
            const users = await getUsers();
            if (controller.signal.aborted) return;
            const saved = await users.patchMeSettings({ [field]: next });
            if (controller.signal.aborted) return;
            confirmed = {
              ...confirmed,
              [field]: NORMALIZERS[field](saved[field]),
            };
            if (submittedRevision === revision[field]) {
              desired = { ...desired, [field]: confirmed[field] };
              dirty.delete(field);
              publish();
            }
          } catch {
            if (controller.signal.aborted) return;
            if (submittedRevision === revision[field]) {
              desired = { ...desired, [field]: confirmed[field] };
              dirty.delete(field);
              publish();
            }
          }
        }
      } finally {
        isSaving = false;
      }
    };

    const edit = (field: RailPreferenceField, update: IdListUpdate) => {
      if (controller.signal.aborted) return;
      revision[field] += 1;
      if (!isReady) queuedEdits.push({ field, update });
      desired = {
        ...desired,
        [field]: NORMALIZERS[field](update(desired[field])),
      };
      dirty.add(field);
      publish();
      void save();
    };
    editRef.current = edit;

    void (async () => {
      try {
        const users = await getUsers();
        if (controller.signal.aborted) return;
        const settings = await users.findMeSettings(controller.signal);
        if (controller.signal.aborted) return;
        confirmed = {
          pinnedAppIds: NORMALIZERS.pinnedAppIds(settings.pinnedAppIds),
          railAppOrder: NORMALIZERS.railAppOrder(settings.railAppOrder),
        };
        desired = { ...confirmed };
        for (const { field, update } of queuedEdits) {
          desired[field] = NORMALIZERS[field](update(desired[field]));
        }
        isReady = true;
        publish();
        if (queuedEdits.length > 0) void save();
      } catch {
        if (controller.signal.aborted) return;
        // Do not replace unknown saved preferences after a failed initial read.
        setLists(emptyLists());
        editRef.current = () => {};
      }
    })();

    return () => {
      controller.abort();
      if (editRef.current === edit) editRef.current = () => {};
    };
  }, [getUsers]);

  const togglePin = useCallback((appId: string) => {
    if (!isNativeSecondaryAppId(appId)) return;
    editRef.current('pinnedAppIds', (ids) => toggledIds(ids, appId));
  }, []);

  const setRailAppOrder = useCallback((order: readonly string[]) => {
    editRef.current('railAppOrder', () => [...order]);
  }, []);

  return {
    pinnedAppIds: lists.pinnedAppIds,
    railAppOrder: lists.railAppOrder,
    setRailAppOrder,
    togglePin,
  };
}
