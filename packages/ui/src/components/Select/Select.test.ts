import { describe, expect, it } from 'vitest';
import { ref } from 'vue';
import { render, screen } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import FFormField from '../FormField/FormField.vue';
import FSelect from './Select.vue';

const countries = [
  { value: 'FR', label: 'France' },
  { value: 'BE', label: 'Belgique' },
  { value: 'ES', label: 'Espagne' }
];

describe('FSelect', () => {
  it('select natif relié à FFormField, avec placeholder non sélectionnable', async () => {
    const country = ref('');
    render({
      components: { FFormField, FSelect },
      setup: () => ({ country, countries }),
      template: `
        <FFormField label="Pays" required error="Choisissez un pays.">
          <FSelect v-model="country" :options="countries" placeholder="Choisissez un pays" />
        </FFormField>`
    });
    const select = screen.getByRole('combobox', { name: 'Pays' });
    expect(select).toBeRequired();
    expect(select).toHaveAttribute('aria-invalid', 'true');
    expect(select).toHaveAccessibleDescription('Choisissez un pays.');
    expect(screen.getByRole('option', { name: 'Choisissez un pays' })).toBeDisabled();

    await userEvent.selectOptions(select, 'ES');
    expect(country.value).toBe('ES');
  });
});
