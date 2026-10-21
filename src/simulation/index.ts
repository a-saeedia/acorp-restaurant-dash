/**
 * Public surface of the simulation domain.
 *
 * The dashboard and the video both import from here — never from a deep path —
 * so the module has one stable contract.
 */

export * from './types';
export * from './config';
export * from './catalog';
export * from './rng';
export * from './analytics';
export * from './orders';
export * from './seed';
export * from './engine';
export * from './selectors';
