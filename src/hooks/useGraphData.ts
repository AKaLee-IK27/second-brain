import { useMemo, useEffect, useState } from 'react';
import { useNoteStore } from '../state/note-store';
import { linkRepository } from '../storage/link-repository';
import { buildGraphData, type GraphData } from '../core/note/graph-builder';
import type { LinkRecord } from '../core/note/note';

export function useGraphData(): GraphData {
  const notes = useNoteStore((s) => s.notes);
  const [links, setLinks] = useState<LinkRecord[]>([]);

  useEffect(() => {
    linkRepository.getAll().then(setLinks);
  }, [notes]);

  return useMemo(() => {
    return buildGraphData(notes, links);
  }, [notes, links]);
}
