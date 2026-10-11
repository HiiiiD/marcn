import { z } from 'zod';

export const signUpSchema = z.object({
  email: z.email('Enter a valid email address.'),
  password: z.string().min(8, 'Use at least 8 characters.'),
  role: z.string().min(1, 'Pick a role.'),
  terms: z.boolean().refine((v) => v, 'You must accept the terms.'),
});

export type SignUp = z.infer<typeof signUpSchema>;

export const signUpDefaults: SignUp = { email: '', password: '', role: '', terms: false };

export const roles = [
  { value: 'designer', label: 'Designer' },
  { value: 'developer', label: 'Developer' },
  { value: 'manager', label: 'Manager' },
];
