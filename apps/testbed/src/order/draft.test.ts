import { describe, expect, it } from 'vitest';
import { isPristine, parseDraft } from './draft';
import { LATEST_VERSION } from './process';

describe('brouillon de commande', () => {
  it('nouveau brouillon : version par défaut', () => {
    expect(parseDraft(null).processVersion).toBe(LATEST_VERSION);
  });

  it('brouillon enregistré avant les versions : il continue en v1', () => {
    const draft = parseDraft(JSON.stringify({ offer: 'plus', method: 'relay' }));
    expect(draft.processVersion).toBe('v1');
    expect(draft.offer).toBe('plus');
    expect(draft.email).toBe('');
  });

  it('version enregistrée : conservée ; version inconnue : v1', () => {
    expect(parseDraft(JSON.stringify({ processVersion: 'v2' })).processVersion).toBe(
      'v2'
    );
    expect(parseDraft(JSON.stringify({ processVersion: 'v9' })).processVersion).toBe(
      'v1'
    );
  });

  it('JSON illisible : brouillon neuf', () => {
    expect(parseDraft('{').offer).toBeUndefined();
  });

  it('un brouillon sans offre n’a pas commencé', () => {
    expect(isPristine(parseDraft(null))).toBe(true);
    expect(isPristine(parseDraft(JSON.stringify({ offer: 'pro' })))).toBe(false);
  });
});
