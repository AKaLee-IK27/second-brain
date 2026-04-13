import { Router } from 'express';
import { searchIndex } from '../services/search-index.js';

const router = Router();

router.post('/', async (req, res) => {
  const { query, type, limit = 20 } = req.body;

  if (!query || typeof query !== 'string') {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_QUERY', message: 'Query string is required' }
    });
  }

  const results = searchIndex.search(query, type, limit);
  res.json({ success: true, data: { results, total: results.length }, meta: { timestamp: new Date().toISOString() } });
});

router.get('/index', (_req, res) => {
  const status = searchIndex.getStatus();
  res.json({ success: true, data: status, meta: { timestamp: new Date().toISOString() } });
});

router.post('/rebuild', async (_req, res) => {
  try {
    await searchIndex.build();
    res.json({ success: true, data: searchIndex.getStatus(), meta: { timestamp: new Date().toISOString() } });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: err instanceof Error ? err.message : String(err) } });
  }
});

export default router;
