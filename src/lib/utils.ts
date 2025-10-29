// Minimal cn utility inspired by shadcn/ui
export function cn(
  ...inputs: Array<string | undefined | null | false | Record<string, boolean>>
): string {
  const classes: string[] = [];
  for (const input of inputs) {
    if (!input) continue;
    if (typeof input === 'string') {
      if (input.trim()) classes.push(input.trim());
    } else if (typeof input === 'object') {
      for (const key in input) {
        if (Object.prototype.hasOwnProperty.call(input, key) && (input as Record<string, boolean>)[key]) {
          classes.push(key);
        }
      }
    }
  }
  return classes.join(' ');
}
