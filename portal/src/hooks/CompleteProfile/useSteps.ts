export const useSteps = (
  isCompany: boolean,
  _rwaRequired: boolean,
  rwaOptional: boolean
) =>
  isCompany
    ? [
        { id: 1, step: 1, title: 'Company KYB', subtitle: '' },
        { id: 2, step: 2, title: 'Directors KYC', subtitle: '' },
        { id: 3, step: 3, title: 'Master RWA Form', subtitle: '' },
      ]
    : [
        { id: 1, step: 1, title: 'User KYC', subtitle: '' },
        ...(rwaOptional
          ? [{ id: 2, step: 2, title: 'Master RWA Form', subtitle: '' }]
          : []),
      ];
