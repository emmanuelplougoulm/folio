import { describe, expect, it } from 'vitest';
import { ref } from 'vue';
import { render, screen } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import FFormField from '../FormField/FormField.vue';
import FTextArea from './TextArea.vue';

describe('FTextArea', () => {
  it('v-model, maxlength natif et compteur traduisible relié au champ', async () => {
    const note = ref('');
    const counter = (length: number, max: number) =>
      `${String(length)} sur ${String(max)} caractères`;
    render({
      components: { FFormField, FTextArea },
      setup: () => ({ note, counter }),
      template: `
        <FFormField label="Instructions" hint="Digicode, étage…">
          <FTextArea v-model="note" :maxlength="20" :counter="counter" />
        </FFormField>`
    });
    const area = screen.getByRole('textbox', { name: 'Instructions' });
    expect(area).toHaveAttribute('maxlength', '20');
    await userEvent.type(area, 'Code 1234');
    expect(note.value).toBe('Code 1234');
    expect(area).toHaveAccessibleDescription('Digicode, étage… 9 sur 20 caractères');
  });

  it('sans compteur, rien n’est ajouté à la description', () => {
    render(FTextArea, { attrs: { 'aria-label': 'Note' }, props: { maxlength: 10 } });
    expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-describedby');
  });
});
