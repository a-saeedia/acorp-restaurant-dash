/**
 * Film-only derived data.
 *
 * Everything is computed from the real simulation at module scope, so the
 * numbers on screen are the numbers the dashboard would show — no mock copy.
 */
import {
  analyticsFor,
  buildOrderWorkflow,
  buildSampleOrder,
  createInitialState,
  deriveStateAt,
  insertOrder,
  inventoryRows,
  lowStockRows,
  marketingFor,
  pipelineCounts,
} from '../simulation';
import { DEMO_NOW_MS } from '../simulation/config';

const base = createInitialState();
const sample = buildSampleOrder();
const withOrder = insertOrder(base, sample);
const events = buildOrderWorkflow(sample.id, DEMO_NOW_MS);

export const FILM = {
  base,
  sample,
  events,
  /** State after the full intake chain (order + stock check + request). */
  after: deriveStateAt(withOrder, events, DEMO_NOW_MS + 9_000),
  analytics: analyticsFor(base, 'month'),
  marketing: marketingFor(base, 'month'),
  inventory: inventoryRows(base),
  lowStock: lowStockRows(base),
  pipeline: pipelineCounts(base),
};
