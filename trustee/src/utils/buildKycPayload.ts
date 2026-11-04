export const buildKycPayload = ({ adminDetail, formData, finalStepData }: any) => {
  return {
    /* ---------- BASIC INFO ---------- */
    firstname: adminDetail.firstname,
    lastname: adminDetail.lastname,
    accountId: adminDetail.id,
    countryId: adminDetail.countryId,

    /* ---------- KYC META ---------- */
    panNumber: formData.panNumber,
    passportNumber: formData.passportNumber ?? null,
    // emiratiId: formData.emiratiId ?? null,
    occupation: formData.occupation,
    monthlyIncome: formData.monthlyIncome,
    dateOfBirth: formData.dateOfBirth,

    /* ---------- DOCUMENTS ---------- */
    documents: [
      formData.pan_indian && {
        developerName: 'pan_indian',
        filename: formData.pan_indian?.split('/').pop(),
      },

      formData.address_proof && {
        developerName: 'address_proof',
        filename: formData.address_proof?.split('/').pop(),
      },

      finalStepData.secondary_id && {
        developerName: 'secondary_id',
        filename: finalStepData.secondary_id?.split('/').pop(),
      },

      finalStepData.selfie_photo && {
        developerName: 'selfie_photo',
        filename: finalStepData.selfie_photo?.split('/').pop(),
      },
    ].filter(Boolean),

    /* ---------- ADDRESS ---------- */
    residentialAddress: {
      addressLine1: formData.addressLine1,
      addressLine2: formData.addressLine2,
      city: formData.city,
      state: formData.state,
      pincode: formData.pincode,
      country: formData.country,
    },

    meta: {
      industry: formData.industry,
      secondaryIdType: finalStepData.secondaryId,
    },
  };
};
