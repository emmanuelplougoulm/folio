import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/vue';
import FFormField from './FormField.vue';
import FTextInput from '../TextInput/TextInput.vue';

const renderField = (
  props: Record<string, unknown>,
  inputProps: Record<string, unknown> = {}
) =>
  render({
    components: { FFormField, FTextInput },
    setup: () => ({ props, inputProps }),
    template: '<FFormField v-bind="props"><FTextInput v-bind="inputProps" /></FFormField>'
  });

describe('FFormField + FTextInput', () => {
  it('relie le libellé au champ', () => {
    renderField({ label: 'Adresse e-mail' }, { type: 'email' });
    const input = screen.getByLabelText('Adresse e-mail');
    expect(input).toHaveAttribute('type', 'email');
    expect(input).not.toHaveAttribute('aria-invalid');
    expect(input).not.toHaveAttribute('aria-describedby');
  });

  it("décrit le champ par l'aide puis par l'erreur, et le passe en invalide", () => {
    renderField({
      label: 'Adresse e-mail',
      hint: 'Nous ne la partagerons pas.',
      error: 'Saisissez une adresse e-mail valide.'
    });
    const input = screen.getByLabelText('Adresse e-mail');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription(
      'Nous ne la partagerons pas. Saisissez une adresse e-mail valide.'
    );
  });

  it('propage required et disabled au champ natif', () => {
    renderField({ label: 'Nom', required: true, disabled: true });
    const input = screen.getByLabelText('Nom');
    expect(input).toBeRequired();
    expect(input).toBeDisabled();
  });

  it('les props du champ priment sur le contexte', () => {
    renderField({ label: 'Nom', required: true }, { required: false });
    expect(screen.getByLabelText('Nom')).not.toBeRequired();
  });

  it('génère des identifiants uniques entre deux champs', () => {
    render({
      components: { FFormField, FTextInput },
      template: `
        <FFormField label="Prénom"><FTextInput /></FFormField>
        <FFormField label="Nom"><FTextInput /></FFormField>`
    });
    expect(screen.getByLabelText('Prénom').id).not.toBe(screen.getByLabelText('Nom').id);
  });

  it('accepte un id explicite', () => {
    renderField({ label: 'E-mail', id: 'email' });
    expect(screen.getByLabelText('E-mail')).toHaveAttribute('id', 'email');
  });
});
