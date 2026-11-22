import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/vue';
import FTable from './Table.vue';

const columns = [
  { key: 'number', label: 'Commande', rowHeader: true },
  { key: 'status', label: 'Statut' },
  { key: 'total', label: 'Total', align: 'end' as const }
];
const rows = [
  { number: 'FO-1', status: 'Livrée', total: '24,80 €' },
  { number: 'FO-2', status: 'Annulée', total: '9,90 €' }
];

describe('FTable', () => {
  it('tableau natif nommé par sa légende, en-têtes de colonnes et de lignes', () => {
    render(FTable, {
      props: { caption: 'Mes commandes', columns, rows, rowKey: 'number' }
    });
    const table = screen.getByRole('table', { name: 'Mes commandes' });
    expect(
      within(table)
        .getAllByRole('columnheader')
        .map((h) => h.textContent.trim())
    ).toEqual(['Commande', 'Statut', 'Total']);
    expect(within(table).getByRole('rowheader', { name: 'FO-2' })).toBeInTheDocument();
    expect(within(table).getAllByRole('row')).toHaveLength(3);
  });

  it('zone de défilement focusable et nommée', () => {
    render(FTable, {
      props: { caption: 'Mes commandes', columns, rows, rowKey: 'number' }
    });
    expect(screen.getByRole('region', { name: 'Mes commandes' })).toHaveAttribute(
      'tabindex',
      '0'
    );
  });

  it('slot cell pour un rendu riche', () => {
    render(FTable, {
      props: { caption: 'Mes commandes', columns, rows, rowKey: 'number' },
      slots: {
        cell: `<template #cell="{ column, value }"><strong v-if="column.key === 'status'">{{ value }}</strong><template v-else>{{ value }}</template></template>`
      }
    });
    expect(screen.getByText('Livrée').tagName).toBe('STRONG');
  });
});
