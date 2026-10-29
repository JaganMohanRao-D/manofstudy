import React, { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../services/firebase";

export type CmsCollectionKey =
  | "site_content"
  | "blogs"
  | "scholarships"
  | "guides"
  | "roadmaps"
  | "tools"
  | "seo_settings"
  | "autonomous_colleges"
  | "datasets";

type PublishedCmsState = {
  byCollection: Record<string, Record<string, Record<string, unknown>>>;
  tombstones: Record<string, string[]>;
  loaded: boolean;
  error: boolean;
};

const EMPTY_STATE: PublishedCmsState = { byCollection: {}, tombstones: {}, loaded: false, error: false };
const PublishedCmsContext = createContext<PublishedCmsState>(EMPTY_STATE);

function stableItemId(item: Record<string, unknown>, idKey: string): string {
  const value = item[idKey] ?? item.id ?? item.slug ?? item.code ?? item.college_code ?? item._key ?? item.college_name;
  return value == null ? "" : String(value).trim();
}

export function CmsContentProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PublishedCmsState>(EMPTY_STATE);

  useEffect(() => {
    let active = true;
    const publishedQuery = query(collection(db, "cms_published"), where("status", "==", "published"));
    const unsubscribe = onSnapshot(
      publishedQuery,
      (snapshot) => {
        if (!active) return;
        const byCollection: Record<string, Record<string, Record<string, unknown>>> = {};
        const tombstones: Record<string, string[]> = {};
        for (const document of snapshot.docs) {
          const data = document.data();
          const collectionKey = typeof data.collectionKey === "string" ? data.collectionKey : "";
          const itemId = typeof data.itemId === "string" ? data.itemId : "";
          if (!collectionKey || !itemId || !data.content || typeof data.content !== "object") continue;
          const content = data.content as Record<string, unknown>;
          if (content.__cmsTombstone === true) {
            (tombstones[collectionKey] ||= []).push(itemId);
            continue;
          }
          (byCollection[collectionKey] ||= {})[itemId] = { ...content };
        }
        setState({ byCollection, tombstones, loaded: true, error: false });
      },
      () => {
        if (active) setState((current) => ({ ...current, loaded: true, error: true }));
      },
    );
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  return <PublishedCmsContext.Provider value={state}>{children}</PublishedCmsContext.Provider>;
}

export function usePublishedCmsContent() {
  return useContext(PublishedCmsContext);
}

/**
 * Merge a bundled baseline with public, owner-published CMS overrides.
 * Tombstones deliberately hide bundled baseline records that were unpublished
 * or moved to the recycle bin. Draft documents never enter this public store.
 */
export function useCmsCollection<T extends Record<string, unknown>>(
  collectionKey: CmsCollectionKey,
  baseItems: T[],
  idKey = "id",
): T[] {
  const state = usePublishedCmsContent();
  return useMemo(() => {
    const map = new Map<string, T>();
    const tombstones = new Set(state.tombstones[collectionKey] || []);
    for (const item of baseItems) {
      const id = stableItemId(item, idKey);
      if (!id || tombstones.has(id)) continue;
      map.set(id, item);
    }
    for (const [id, content] of Object.entries(state.byCollection[collectionKey] || {})) {
      if (tombstones.has(id) || content.__cmsTombstone === true) continue;
      const baseline = map.get(id) || ({} as T);
      map.set(id, { ...baseline, ...content, [idKey]: (content[idKey] ?? id) } as T);
    }
    return [...map.values()];
  }, [state.byCollection, state.tombstones, collectionKey, baseItems, idKey]);
}
