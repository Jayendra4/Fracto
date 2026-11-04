export const scrollToSection = (id: string) => {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

export const getUserName = (user: any) =>
  user?.data?.firstname || user?.firstname || 'User';

export const resolveDirectorKycStep = (step: number): 1 | 2 => {
  return step === 1 || step === 2 ? step : 2;
};
