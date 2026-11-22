import { describe, expect, it } from 'vitest';
import { ref } from 'vue';
import { render, screen } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import FRadioGroup from './RadioGroup.vue';

const options = [
  { value: 'home', label: 'À domicile', description: '3 jours ouvrés' },
  { value: 'relay', label: 'En point relais' },
  { value: 'drone', label: 'Par drone', disabled: true }
] as const;

describe('FRadioGroup', () => {
  it('fieldset nommé par sa légende, radios natifs du même nom', () => {
    render(FRadioGroup, {
      props: { legend: 'Mode de livraison', options, id: 'delivery' }
    });
    const group = screen.getByRole('group', { name: 'Mode de livraison' });
    const radios = screen.getAllByRole('radio');
    expect(group).toHaveAttribute('id', 'delivery');
    expect(radios).toHaveLength(3);
    expect(new Set(radios.map((r) => r.getAttribute('name')))).toEqual(
      new Set(['delivery'])
    );
    expect(radios[0]).toHaveAttribute('id', 'delivery-0');
    expect(radios[0]).toHaveAccessibleDescription('3 jours ouvrés');
    expect(radios[2]).toBeDisabled();
  });

  it('v-model et flèches du clavier', async () => {
    const value = ref<string | undefined>();
    render({
      components: { FRadioGroup },
      setup: () => ({ value, options }),
      template:
        '<FRadioGroup v-model="value" legend="Mode de livraison" :options="options" />'
    });
    await userEvent.click(screen.getByLabelText('À domicile'));
    expect(value.value).toBe('home');
    await userEvent.keyboard('{ArrowDown}');
    expect(value.value).toBe('relay');
    expect(screen.getByLabelText('En point relais')).toHaveFocus();
  });

  it('erreur reliée au groupe et radios invalides', () => {
    render(FRadioGroup, {
      props: {
        legend: 'Mode de livraison',
        options,
        error: 'Choisissez un mode de livraison.',
        hint: 'Frais inclus.'
      }
    });
    expect(screen.getByRole('group')).toHaveAccessibleDescription(
      'Frais inclus. Choisissez un mode de livraison.'
    );
    expect(screen.getAllByRole('radio')[0]).toHaveAttribute('aria-invalid', 'true');
  });
});
