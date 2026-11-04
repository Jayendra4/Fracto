export const KYB_STEPPER = (step: number) => ({
  step,
  totalSteps: 4,
  stepTitles: {
    1: 'Company Basic Details',
    2: 'Tax & Regulatory Details',
    3: 'Business Profile',
    4: 'Documents Upload',
  },
});

export const RWA_STEPPER = (step: number) => ({
  step,
  totalSteps: 4,
  stepTitles: {
    1: 'Asset Basic Information',
    2: 'Ownership & Title Details',
    3: 'Financial & Valuation Details',
    4: 'Engineering / Technical Details',
  },
});

export const DIRECTOR_KYC_STEPPER = {
  step: 1 as 1 | 2,
  totalSteps: 2,
  stepTitles: {
    1: 'Director / UBO Identity Information',
    2: 'Documents Upload',
  },
};

export const USER_KYC_STEPPER = (step: 1 | 2) => ({
  step,
  totalSteps: 2,
  stepTitles: {
    1: 'Identity Information',
    2: 'Documents Upload',
  },
});
