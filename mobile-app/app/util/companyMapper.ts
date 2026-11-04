import moment from "moment";

export const mapCompanyToSteps = (company: any) => {


    const docs = company?.entityDocument ?? [];

    const getDoc = (typeId: number) =>
        docs.find((d: any) => d.documentTypeId === typeId)?.url ?? null;

    const step1 = {
        legalEntityName: company?.legalEntityName ?? "",
        tradeName: company?.tradeName ?? "",
        cinNumber: company?.cinOrTradeLicenseNo ?? "",
        incorporationDate: company?.dateOfIncorporation
            ? moment(company.dateOfIncorporation).format("DD/MM/YYYY")
            : "",
        entityType: company?.entityType ?? "",

        registeredAddress: company?.registeredAddress?.addressLine1 ?? "",
        city: company?.registeredAddress?.city ?? "",
        state: company?.registeredAddress?.state ?? "",
        pincode: company?.registeredAddress?.pincode ?? "",
        country: company?.registeredAddress?.country ?? "",

        industryType: company?.meta?.industryType ?? "",
        companyEmail: company?.companyEmail ?? "",
        companyPhone: company?.companyPhone ?? "",
        website: company?.websiteUrl ?? "",
        landmark: company?.registeredAddress?.addressLine2 ?? "",
    };

    const step2 = {
        panNumber: company?.meta?.panNumber ?? "",
        gstNumber: company?.meta?.gstNumber ?? "",
        tanNumber: company?.meta?.tanNumber ?? "",
        expiryDate: company?.meta?.tradeLicenseExpiryDate
            ? moment(company.meta.tradeLicenseExpiryDate).format("DD/MM/YYYY")
            : "",
        placeOfBusinessProofType: company?.meta?.placeOfBusinessProofType ?? "",
    };

    const step3 = {
        natureOfBusiness: company?.meta?.natureOfBusiness ?? "",

        countriesOfOperation: company?.meta?.countriesOfOperation?.[0] ?? "",

        expectedMonthlyTransactionVolume:
            company?.meta?.expectedMonthlyTransactionVolume != null
                ? String(company.meta.expectedMonthlyTransactionVolume)
                : "",

        expectedSourceOfFunds: company?.meta?.expectedSourceOfFunds ?? "",

        businessDescription: company?.meta?.businessDescription ?? "",

        isCompanyPubliclyListed:
            company?.meta?.isCompanyPubliclyListed === true
                ? "Yes"
                : company?.meta?.isCompanyPubliclyListed === false
                    ? "No"
                    : "",
    };


    const step4 = {
        auditedFinancials: getDoc(7),
        netWorthCertificate: getDoc(9),
        businessPanCard: getDoc(10),

        certificateOfIncorporation: getDoc(1),
        moa: getDoc(2),
        aoa: getDoc(3),
        companyPan: getDoc(4),
        gstCertificate: getDoc(5),
        tradeLicense: getDoc(6),
        registeredAddressProofFile: getDoc(8),

        shareholdingPattern: company?.meta?.shareholdingPattern ?? "",
        registeredAddressProofType: company?.meta?.registeredAddressProofType ?? "",
        authorizeHouseOfFrac: company?.meta?.authorizeHouseOfFrac ? "Yes" : "No",
        authorizedSignatoryName: company?.meta?.authorizedSignatoryName ?? "",
    };


    return {
        step1,
        step2,
        step3,
        step4,
    };
};