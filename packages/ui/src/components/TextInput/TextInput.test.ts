import { describe, expect, it } from 'vitest';
import { ref } from 'vue';
import { render, screen } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import FTextInput from './TextInput.vue';

describe('FTextInput', () => {
  it('fonctionne en v-model et transmet les attributs natifs', async () => {
    const value = ref('');
    render({
      components: { FTextInput },
      setup: () => ({ value }),
      template:
        '<label for="e">E-mail</label><FTextInput id="e" v-model="value" type="email" name="email" autocomplete="email" />'
    });
    const input = screen.getByLabelText('E-mail');
    expect(input).toHaveAttribute('name', 'email');
    expect(input).toHaveAttribute('autocomplete', 'email');
    await userEvent.type(input, 'ana@exemple.es');
    expect(value.value).toBe('ana@exemple.es');
  });

  it('hors FFormField : non requis, non invalide par défaut', () => {
    render(FTextInput, { attrs: { 'aria-label': 'Recherche' } });
    const input = screen.getByRole('textbox', { name: 'Recherche' });
    expect(input).not.toBeRequired();
    expect(input).not.toHaveAttribute('aria-invalid');
  });

  it('invalid explicite', () => {
    render(FTextInput, { props: { invalid: true }, attrs: { 'aria-label': 'Code' } });
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });
});
