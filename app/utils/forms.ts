// TODO [FORMS-01]: Extend runtime field/length/date/locale validation and shared-control parity; repeat every relevant check server-side and retain accessible error/focus behavior for async submissions. See docs/integration-audit.md.
import type { FormField, FormValue } from '../types/forms';
export function visibleFields(fields: FormField[], values: Record<string, FormValue>): FormField[] {
  return fields.filter((f) => !f.showWhen || values[f.showWhen.field] === f.showWhen.equals);
}
export function validateFields(
  fields: FormField[],
  values: Record<string, FormValue>,
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const field of visibleFields(fields, values)) {
    const value = values[field.name];
    const text = String(value ?? '').trim();
    if (
      field.required &&
      (value === false ||
        value === undefined ||
        text === '' ||
        (Array.isArray(value) && !value.length))
    ) {
      errors[field.name] = 'This field is required.';
      continue;
    }
    if (!text) continue;
    if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text))
      errors[field.name] = 'Enter a valid email address.';
    if (field.type === 'url') {
      try {
        const url = new URL(text);
        if (!['https:', 'http:'].includes(url.protocol)) throw Error();
      } catch {
        errors[field.name] = 'Enter a full http or https URL.';
      }
    }
    if (field.minLength && text.length < field.minLength)
      errors[field.name] = `Enter at least ${field.minLength} characters.`;
    if (field.type === 'number' || field.type === 'range') {
      const n = Number(text);
      if (!Number.isFinite(n)) errors[field.name] = 'Enter a number.';
      else if (field.min !== undefined && n < field.min)
        errors[field.name] = `Minimum value is ${field.min}.`;
      else if (field.max !== undefined && n > field.max)
        errors[field.name] = `Maximum value is ${field.max}.`;
    }
    if (field.options && !field.options.some((o) => o.value === value && !o.disabled))
      errors[field.name] = 'Choose an available option.';
  }
  return errors;
}
