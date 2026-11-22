import { describe, expect, it } from 'vitest';
import { ref } from 'vue';
import { render, screen } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import FTabs from './Tabs.vue';

const tabs = [
  { value: 'orders', label: 'Commandes' },
  { value: 'profile', label: 'Profil' }
];

const setup = () => {
  const active = ref('orders');
  render({
    components: { FTabs },
    setup: () => ({ active, tabs }),
    template: `
      <FTabs v-model="active" :tabs="tabs" label="Sections du compte">
        <template #orders><p>Liste des commandes</p></template>
        <template #profile><p>Informations du profil</p></template>
      </FTabs>`
  });
  return active;
};

describe('FTabs', () => {
  it('liste d’onglets nommée, onglet actif et panneau associé', () => {
    setup();
    expect(
      screen.getByRole('tablist', { name: 'Sections du compte' })
    ).toBeInTheDocument();
    const tab = screen.getByRole('tab', { name: 'Commandes' });
    expect(tab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel', { name: 'Commandes' })).toHaveTextContent(
      'Liste des commandes'
    );
  });

  it('flèches du clavier et v-model', async () => {
    const active = setup();
    await userEvent.click(screen.getByRole('tab', { name: 'Commandes' }));
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Profil' })).toHaveFocus();
    expect(active.value).toBe('profile');
    expect(screen.getByRole('tabpanel', { name: 'Profil' })).toHaveTextContent(
      'Informations du profil'
    );
  });
});
