import type { FormSchema } from '../../../../../app/types/forms';

export const contactForm: FormSchema = {
  id: 'contact',
  title: 'Let’s start a conversation',
  description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  submitLabel: 'Send example message',
  fields: [
    { name: 'name', label: 'Full name', type: 'text', required: true },
    { name: 'email', label: 'Email address', type: 'email', required: true },
    {
      name: 'topic',
      label: 'How can we help?',
      type: 'select',
      required: true,
      options: [
        { label: 'General inquiry', value: 'general' },
        { label: 'Our services', value: 'services' },
      ],
    },
    { name: 'message', label: 'Your message', type: 'textarea', required: true, minLength: 10 },
    {
      name: 'consent',
      label: 'I understand this is a demonstration form.',
      type: 'checkbox',
      required: true,
    },
  ],
};
