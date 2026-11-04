export const isValidStep = (step: number | null): step is number =>
  typeof step === 'number';
