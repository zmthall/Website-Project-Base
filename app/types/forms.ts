export type FormValue = string | number | boolean | string[];
export interface FormOption {
  label: string;
  value: string;
  disabled?: boolean;
}
export interface FormField {
  name: string;
  label: string;
  type:
    | 'text'
    | 'email'
    | 'tel'
    | 'url'
    | 'number'
    | 'date'
    | 'time'
    | 'search'
    | 'textarea'
    | 'select'
    | 'checkbox'
    | 'radio'
    | 'range';
  placeholder?: string;
  help?: string;
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  options?: FormOption[];
  showWhen?: { field: string; equals: FormValue };
}
export interface FormSchema {
  id: string;
  title: string;
  description?: string;
  submitLabel?: string;
  fields: FormField[];
}
