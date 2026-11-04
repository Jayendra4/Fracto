import moment from "moment";

export const mapDirectorToSteps = (director: any) => {

    const docs = director?.documents ?? [];

    const getDoc = (name: string) =>
        docs.find((d: any) => d.documentDeveloperName === name)?.url ?? null;

    const step1 = {
        firstName: director?.firstName?.trim() ?? "",
        lastName: director?.lastName?.trim() ?? "",
        roleInCompany: director?.roleInCompany ?? "",

        dob: director?.dateOfBirth
            ? moment(director.dateOfBirth).format("DD/MM/YYYY")
            : "",

        nationality: director?.nationality ?? "",

        panNumber: director?.directorMeta?.panNumber ?? "",
        emiratesIdNumber: director?.directorMeta?.emiratesIdNumber,

        passportNumber: director?.directorMeta?.passportNumber ?? "",

        registeredAddress: director?.permanentAddress?.addressLine1 ?? "",
        landmark: director?.permanentAddress?.addressLine2 ?? "",

        city: director?.permanentAddress?.city ?? "",
        state: director?.permanentAddress?.state ?? "",
        country: director?.permanentAddress?.country ?? "",
        pincode: director?.permanentAddress?.pincode ?? "",

        companyPhone: director?.mobileNumber ?? "",
        email: director?.email ?? "",
    };

    const step2 = {
        panCard: getDoc("pan_indian"),
        passport: getDoc("passport"),

        addressProofType: "",
        addressProofFile: getDoc("address_proof"),

        passportSizePhoto: getDoc("passport_photo"),

        secondaryIdType: "",
        secondaryIdFile: getDoc("secondary_id"),

        businessPanCard: getDoc("business_pan"),

        selfiePhoto: getDoc("selfie"),
    };

    return {
        step1,
        step2,
    };
};