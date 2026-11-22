import { describe, expect, it } from 'vitest';
import light from '../styles/tokens-light.generated.json';
import dark from '../styles/tokens-dark.generated.json';
import { contrastRatio } from './contrast';

type Tokens = Record<string, string>;

/** Seuils WCAG 2.2 AA : 4,5:1 pour le texte (1.4.3), 3:1 pour les composants et le focus (1.4.11). */
const TEXT = 4.5;
const UI = 3;

const pairs: [foreground: string, background: string, min: number][] = [
  ['ColorText', 'ColorBg', TEXT],
  ['ColorText', 'ColorSurface', TEXT],
  ['ColorText', 'ColorSurfaceHover', TEXT],
  ['ColorText', 'ColorAccentSubtle', TEXT],
  ['ColorTextMuted', 'ColorBg', TEXT],
  ['ColorTextMuted', 'ColorSurface', TEXT],
  ['ColorBorder', 'ColorBg', UI],
  ['ColorBorder', 'ColorSurface', UI],
  ['ColorFocus', 'ColorBg', UI],
  ['ColorFocus', 'ColorSurface', UI],
  ['ColorAccent', 'ColorBg', TEXT],
  ['ColorAccent', 'ColorSurface', TEXT],
  ['ColorAccent', 'ColorAccentSubtle', TEXT],
  ['ColorOnAccent', 'ColorAccent', TEXT],
  ['ColorOnAccent', 'ColorAccentHover', TEXT],
  ['ColorDanger', 'ColorBg', TEXT],
  ['ColorDanger', 'ColorSurface', TEXT],
  ['ColorDanger', 'ColorDangerSubtle', TEXT],
  ['ColorOnDanger', 'ColorDanger', TEXT],
  ['ColorOnDanger', 'ColorDangerHover', TEXT],
  ['ColorSuccess', 'ColorBg', TEXT],
  ['ColorSuccess', 'ColorSuccessSubtle', TEXT],
  ['ColorWarning', 'ColorBg', TEXT],
  ['ColorWarning', 'ColorWarningSubtle', TEXT]
];

describe.each([
  ['clair', light as Tokens],
  ['sombre', dark as Tokens]
])('contrastes du thème %s', (_, tokens) => {
  it.each(pairs)('%s sur %s ≥ %s:1', (fg, bg, min) => {
    const a = tokens[fg];
    const b = tokens[bg];
    expect(a, `token ${fg} absent`).toBeDefined();
    expect(b, `token ${bg} absent`).toBeDefined();
    expect(contrastRatio(a ?? '', b ?? '')).toBeGreaterThanOrEqual(min);
  });
});

describe('contrastRatio', () => {
  it('donne 21:1 entre noir et blanc et 1:1 entre deux couleurs identiques', () => {
    expect(contrastRatio('#000', '#ffffff')).toBeCloseTo(21, 5);
    expect(contrastRatio('#1e3a5f', '#1E3A5F')).toBe(1);
  });
});
