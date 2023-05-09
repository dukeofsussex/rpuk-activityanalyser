import { writable } from 'svelte/store';

export interface Filter {
  query: string;
  threshold: {
    above: boolean;
    below: boolean;
    value: number | null;
  };
}

export interface Input {
  open: boolean;
  valid: boolean;
  value: string;
}

export const filter = writable<Filter>({
  query: '',
  threshold: {
    above: true,
    below: true,
    value: null,
  },
});
export const input = writable<Input>({
  open: true,
  valid: true,
  value: '',
});
