import { inject, type ComputedRef, type InjectionKey } from 'vue';

/** Ce qu'un champ de formulaire reçoit de son FFormField parent. */
export interface FormFieldContext {
  id: string;
  describedBy: ComputedRef<string | undefined>;
  invalid: ComputedRef<boolean>;
  required: ComputedRef<boolean>;
  disabled: ComputedRef<boolean>;
}

export const formFieldKey: InjectionKey<FormFieldContext> = Symbol('FFormField');

/** Contexte du FFormField englobant, ou undefined pour un champ autonome. */
export const useFormField = (): FormFieldContext | undefined =>
  inject(formFieldKey, undefined);
