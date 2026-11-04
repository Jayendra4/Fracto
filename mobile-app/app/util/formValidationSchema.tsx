import * as Yup from 'yup';
import { AccountType } from '../store/authSlice.types';

export const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;

export const PasswordSchema = Yup.object({
    password: Yup.string()
        .min(8, 'Minimum length at 8 characters')
        .matches(/[A-Z]/, 'At least one uppercase character is required')
        .matches(/[a-z]/, 'At least one lowercase character is required')
        .matches(/\d/, 'Number character(s) is required')
        .required('Password is required'),

    confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], 'Password do not match')
        .required('Confirm password is required'),
});

export const SignUpSchema = Yup.object({
    firstName: Yup.string()
        .matches(/^[A-Za-z]+$/, 'First name must contain only letters with no spaces')
        .required('First name is required'),

    lastName: Yup.string()
        .matches(/^[A-Za-z]+$/, 'Last name must contain only letters with no spaces')
        .required('Last name is required'),

    email: Yup.string()
        .email('Enter a valid email')
        .required('Email is required'),

    mobile: Yup.string()
        .test(
            'valid-mobile',
            'Enter a valid mobile number',
            value => {
                if (!value) return false;
                if (value.startsWith('+91')) return /^\+91\d{10}$/.test(value);
                if (value.startsWith('+971')) return /^\+971\d{9}$/.test(value);
                return false;
            }
        )
        .required('Mobile number is required'),
});

export const AccountTypeSchema = Yup.object().shape({
    accountType: Yup.string()
        .required('Account type is required'),
    country: Yup.string()
        .required('Country is required'),
});

export const getLoginSchema = (activeTab: "email" | "phone") =>
    Yup.object().shape({
        email: activeTab === "email"
            ? Yup.string()
                .email("Enter a valid email")
                .required("Email is required")
            : Yup.string().notRequired(),

        mobile: activeTab === "phone"
            ? Yup.string()
                .required("Mobile number is required")
                .test(
                    "valid-mobile",
                    "Enter a valid mobile number",
                    value => {
                        if (!value) return false;
                        if (value.startsWith("+91")) return /^\+91\d{10}$/.test(value);
                        if (value.startsWith("+971")) return /^\+971\d{9}$/.test(value);
                        return false;
                    }
                )
            : Yup.string().notRequired(),

        password: Yup.string()
            .min(8, 'Minimum length at 8 characters')
            .matches(/[A-Z]/, 'At least one uppercase character is required')
            .matches(/[a-z]/, 'At least one lowercase character is required')
            .matches(/\d/, 'Number character(s) is required')
            .required('Password is required'),
    });

export const getForgotSchema = (activeTab: "email" | "phone") =>
    Yup.object().shape({
        email: activeTab === "email"
            ? Yup.string().email("Enter a valid email address").required("Email Address is required")
            : Yup.string().notRequired(),
        mobile: activeTab === "phone"
            ? Yup.string()
                .test("valid-mobile", "Enter a valid mobile number", value => {
                    if (!value) return false;
                    if (value.startsWith("+91")) return /^\+91\d{10}$/.test(value);
                    if (value.startsWith("+971")) return /^\+971\d{9}$/.test(value);
                    return false;
                })
                .required("Mobile number is required")
            : Yup.string().notRequired(),
    });

export const ResetSchema = Yup.object({
    otp: Yup.string()
        .length(6, 'OTP must be 6 digits')
        .required('OTP is required'),
    newPassword: Yup.string()
        .min(8, 'Minimum length at 8 characters')
        .matches(/[A-Z]/, 'At least one uppercase character is required')
        .matches(/[a-z]/, 'At least one lowercase character is required')
        .matches(/\d/, 'Number character(s) is required')
        .required('New Password is required'),

    confirmPassword: Yup.string()
        .oneOf([Yup.ref('newPassword')], 'Password do not match')
        .required('Confirm password is required'),
});

export const KycStep1Schema = Yup.object().shape({
    pan: Yup.string()
        .matches(/[A-Z]{5}[0-9]{4}[A-Z]{1}/, 'Enter a valid PAN number')
        .required('PAN number is required'),

    dateOfBirth: Yup.string()
        .required('Date of birth is required'),

    licenseNumber: Yup.string().when("accountType", {
        is: AccountType.Broker,
        then: (schema) =>
            schema
                .matches(/^[A-Z]{2}[0-9]{2}[0-9]{4}[0-9]{7}$/, 'Enter a valid license number')
                .required('License number is required'),
        otherwise: (schema) => schema.notRequired(),
    }),

    licenseExpiry: Yup.string().when("accountType", {
        is: AccountType.Broker,
        then: (schema) => schema.required('License expiry is required'),
        otherwise: (schema) => schema.notRequired(),
    }),

    panFile: Yup.mixed()
        .required('PAN file is required')
        .test(
            'fileSize',
            'File size must be less than 4MB',
            (value: any) => !value || value.size <= 4 * 1024 * 1024
        )
        .test(
            'fileType',
            'Only PDF, JPG, PNG files are allowed',
            (value: any) =>
                !value ||
                ['application/pdf', 'image/jpeg', 'image/png'].includes(value.type)
        ),
});

export const KycStep2Schema = Yup.object().shape({
    occupation: Yup.string()
        .trim()
        .required('Occupation is required'),

    occupationIndustry: Yup.string()
        .trim()
        .required('Occupation Industry is required'),

    monthlyIncome: Yup.string()
        .trim()
        .required('Monthly Income is required'),
});

export const KycStep3Schema = Yup.object().shape({
    address: Yup.string()
        .trim()
        .required("Permanent address is required"),

    landmark: Yup.string()
        .trim()
        .nullable(),

    city: Yup.string()
        .required("City is required"),

    state: Yup.string()
        .required("State is required"),

    pincode: Yup.string()
        .matches(/^[0-9]{6}$/, "Enter a valid 6-digit pincode")
        .required("Pincode is required"),

    country: Yup.string()
        .required("Country is required"),

    addressId: Yup.string()
        .required("Please select address proof type"),

    addressProof: Yup.mixed()
        .required("Address proof is required")
        .test(
            "fileSize",
            "File size must be less than 4MB",
            (file: any) => {
                if (!file) return false;
                return file.size <= 4 * 1024 * 1024;
            }
        )
        .test(
            "fileType",
            "Only JPEG, PNG, or PDF files are allowed",
            (file: any) => {
                if (!file) return false;
                return ["image/jpeg", "image/png", "application/pdf"].includes(
                    file.type
                );
            }
        ),
});

export const personalInformationSchema = Yup.object().shape({
    firstname: Yup.string()
        .min(2, 'First name is too short')
        .required('First name is required'),

    lastname: Yup.string()
        .min(2, 'Last name is too short')
        .required('Last name is required'),

    email: Yup.string()
        .email('Enter a valid email')
        .required('Email is required'),

    mobile: Yup.string()
        .matches(/^[6-9]\d{9}$/, 'Enter a valid mobile number')
        .required('Mobile number is required'),

    occupation: Yup.string()
        .required('Occupation is required'),

    monthlyIncome: Yup.string()
        .required('Monthly income is required'),

    pan: Yup.string()
        .matches(
            /^[A-Z]{5}[0-9]{4}[A-Z]$/,
            'Enter a valid PAN (ABCDE1234F)'
        )
        .required('PAN number is required'),

    status: Yup.string()
        .required('Status is required'),

    accountType: Yup.string()
        .required('Account type is required'),
});

export const brokerProfileSchema = Yup.object().shape({
    firstname: Yup.string()
        .min(2, 'First name is too short')
        .required('First name is required'),

    lastname: Yup.string()
        .min(2, 'Last name is too short')
        .required('Last name is required'),

    email: Yup.string()
        .email('Enter a valid email')
        .required('Email is required'),

    phone: Yup.string()
        .matches(/^[6-9]\d{9}$/, 'Enter a valid mobile number')
        .required('Mobile number is required'),

    address: Yup.string()
        .required('Address is required'),
})

export const AddBankAccountSchema = Yup.object().shape({
    accountHolderName: Yup.string()
        .min(3, "Name is too short")
        .required("Account holder name is required"),

    bankName: Yup.string()
        .required("Bank name is required"),

    accountNumber: Yup.string()
        .trim()
        .matches(/^\d+$/, "Account number must contain only digits")
        .min(9, "Account number must be at least 9 digits")
        .max(18, "Account number cannot exceed 18 digits")
        .required("Account number is required"),

    ifsc: Yup.string()
        .matches(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code")
        .required("IFSC code is required"),
});

export const ChangePasswordSchema = Yup.object().shape({
    currentPassword: Yup.string()
        .min(8, 'Minimum length at 8 characters')
        .matches(/[A-Z]/, 'At least one uppercase character is required')
        .matches(/[a-z]/, 'At least one lowercase character is required')
        .matches(/\d/, 'Number character(s) is required')
        .required('Current password is required'),

    newPassword: Yup.string()
        .min(8, 'Minimum length at 8 characters')
        .matches(/[A-Z]/, 'At least one uppercase character is required')
        .matches(/[a-z]/, 'At least one lowercase character is required')
        .matches(/\d/, 'Number character(s) is required')
        .required("New password is required"),

    confirmPassword: Yup.string()
        .oneOf([Yup.ref('newPassword')], 'Passwords must match')
        .required("Confirm password is required"),
});

export const AddUPIIDSchema = Yup.object().shape({
    upiId: Yup.string()
        .matches(
            /^[a-zA-Z0-9._-]{2,256}@[a-zA-Z]{2,64}$/,
            "Enter a valid UPI ID (e.g. name@bank)"
        )
        .required("UPI ID is required"),
});

export const AddMoneySchema = Yup.object().shape({
    amount: Yup.string()
        .required("Amount is required")
        .test(
            "valid-amount",
            "Amount must be greater than 0",
            (value) => {
                if (!value) return false;
                return Number(value?.replace(/,/g, '')) > 0;
            }
        ),

    paymentMode: Yup.string()
        .oneOf(["BANK", "UPI"])
        .required("Payment mode is required"),

    upiId: Yup.string().when("paymentMode", {
        is: "UPI",
        then: (schema) =>
            schema
                .required("UPI ID is required")
                .matches(
                    upiRegex,
                    "Enter a valid UPI ID (e.g. name@bank)"
                ),
        otherwise: (schema) => schema.notRequired(),
    }),
});

export const WithdrawMoneySchema = Yup.object().shape({
    amount: Yup.string()
        .required("Amount is required")
        .test(
            "valid-amount",
            "Amount must be greater than 0",
            (value) => {
                if (!value) return false;
                return Number(value?.replace(/,/g, '')) > 0;
            }
        ),

    paymentMode: Yup.string()
        .oneOf(["BANK"], "Invalid payment mode")
        .required("Please select a bank account"),
});

export const CompanyKYBStep1Schema = Yup.object().shape({
    legalEntityName: Yup.string().required("Legal Entity Full Name is required"),
    cinNumber: Yup.string().required("CIN / Trade License Number is required"),
    incorporationDate: Yup.string().required("Date of Incorporation is required"),
    entityType: Yup.string().required("Entity Type is required"),
    country: Yup.string().required("Country is required"),
    registeredAddress: Yup.string().required("Registered Address is required"),
    landmark: Yup.string().nullable(),
    city: Yup.string().required("City is required"),
    state: Yup.string().required("State is required"),
    pincode: Yup.string()
        .required("Pincode is required")
        .matches(/^[0-9]{6}$/, "Pincode must be exactly 6 digits"),
    industryType: Yup.string().required("Industry Type is required"),
    companyEmail: Yup.string()
        .email("Invalid email address")
        .required("Company Email is required"),
    companyPhone: Yup.string().required("Company Phone Number is required"),
    website: Yup.string().url("Invalid website URL").nullable(),
});

export const CompanyKYBStep2Schema = Yup.object().shape({
    panNumber: Yup.string()
        .required("PAN Number is required")
        .matches(
            /^[A-Z]{5}[0-9]{4}[A-Z]$/,
            "Enter a valid PAN Number"
        ),

    gstNumber: Yup.string()
        .nullable()
        .notRequired()
        .test(
            "gst-validation",
            "Enter a valid GST Number",
            (value) => {
                if (!value) return true;
                return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(value);
            }
        ),

    tanNumber: Yup.string()
        .nullable()
        .notRequired()
        .test(
            "tan-validation",
            "Enter a valid TAN Number",
            (value) => {
                if (!value) return true;
                return /^[A-Z]{4}[0-9]{5}[A-Z]$/.test(value);
            }
        ),
    expiryDate: Yup.date()
        .transform((value, originalValue) => {
            if (typeof originalValue === "string") {
                const [day, month, year] = originalValue.split("/");
                return new Date(`${year}-${month}-${day}`);
            }
            return value;
        })
        .required("Expiry date is required"),

    placeOfBusinessProofType: Yup.string()
        .required("Proof of Place of Business is required"),
});

export const CompanyKYBStep3Schema = Yup.object().shape({
    natureOfBusiness: Yup.string()
        .required("Business category is required"),

    countriesOfOperation: Yup.string()
        .required("Countries of operation is required"),

    expectedMonthlyTransactionVolume: Yup.string()
        .required("Expected monthly transaction volume is required"),

    expectedSourceOfFunds: Yup.string()
        .required("Source of funds is required"),

    businessDescription: Yup.string()
        .min(20, "Business description must be at least 20 characters")
        .required("Business description is required"),

    isCompanyPubliclyListed: Yup.string()
        .oneOf(["Yes", "No"])
        .required("Please select an option"),
});

export const CompanyKYBStep4Schema = Yup.object().shape({
    gstCertificate: Yup.mixed()
        .required("GST Certificate is required"),

    tradeLicense: Yup.mixed()
        .required("Trade License is required"),

    certificateOfIncorporation: Yup.mixed()
        .required("Certificate of Incorporation is required"),

    moa: Yup.mixed()
        .required("Memorandum of Association is required"),

    aoa: Yup.mixed()
        .required("Articles of Association is required"),

    companyPan: Yup.mixed()
        .required("Company PAN is required"),

    auditedFinancials: Yup.mixed()
        .required("Audited Financials is required"),

    netWorthCertificate: Yup.mixed()
        .required("Net Worth Certificate is required"),

    shareholdingPattern: Yup.string()
        .trim()
        .required("Shareholding pattern is required"),

    registeredAddressProofType: Yup.string()
        .oneOf(["Tax receipt", "Utility bill"])
        .required("Select registered address proof type"),

    registeredAddressProofFile: Yup.mixed()
        .required("Registered address proof document is required"),

    authorizeHouseOfFrac: Yup.string()
        .oneOf(["Yes", "No"])
        .required("Please select an option"),

    authorizedSignatoryName: Yup.string()
        .trim()
        .when("authorizeHouseOfFrac", {
            is: "Yes",
            then: (schema) =>
                schema.required("Authorized signatory name is required"),
            otherwise: (schema) => schema.notRequired(),
        }),
});

export const AddDirectorSchema = Yup.object().shape({
    firstName: Yup.string()
        .trim()
        .required("First name is required"),
    lastName: Yup.string()
        .trim()
        .required("Last name is required"),
});

export const DirectorsKYCStep1Schema = Yup.object().shape({
    firstName: Yup.string().required("First name is required"),

    lastName: Yup.string().required("Last name is required"),

    roleInCompany: Yup.string()
        .required("Role in company is required"),

    dob: Yup.string()
        .required("Date of birth is required"),

    nationality: Yup.string()
        .required("Nationality is required"),

    panNumber: Yup.string()
        .trim()
        .when("nationality", {
            is: (val: string) => val?.includes("India"),
            then: (schema) =>
                schema.required("PAN number is required"),
            otherwise: (schema) =>
                schema.notRequired(),
        }),

    passportNumber: Yup.string()
        .notRequired()
        .test(
            'passport-validation',
            'Invalid passport number',
            function (value) {
                if (!value) return true;

                const passportRegex = /^[A-Z0-9]{6,9}$/;
                return passportRegex.test(value);
            }
        ),

    emiratesIdNumber: Yup.string()
        .trim()
        .when("nationality", {
            is: (val: string) => val?.includes("UAE"),
            then: (schema) =>
                schema.required("Emirates ID is required"),
            otherwise: (schema) =>
                schema.notRequired(),
        }),

    registeredAddress: Yup.string()
        .trim()
        .required("Registered address is required"),

    landmark: Yup.string()
        .trim()
        .notRequired()
        .min(3, "Landmark must be at least 3 characters"),

    city: Yup.string()
        .trim()
        .required("City is required"),

    state: Yup.string()
        .trim()
        .required("State is required"),

    pincode: Yup.string()
        .trim()
        .required("Pincode is required"),

    country: Yup.string()
        .required("Country is required"),

    companyPhone: Yup.string()
        .trim()
        .required("Company phone number is required"),

    email: Yup.string()
        .email("Enter a valid email")
        .required("Email is required"),
});

export const DirectorsKYCStep2Schema = Yup.object().shape({
    panCard: Yup.mixed()
        .required("PAN card is required"),

    addressProofType: Yup.string()
        .required("Address proof type is required"),

    addressProofFile: Yup.mixed()
        .required("Address proof file is required"),

    passportSizePhoto: Yup.mixed()
        .nullable(),

    secondaryIdType: Yup.string()
        .required("Secondary ID type is required"),

    secondaryIdFile: Yup.mixed()
        .required("Secondary ID file is required"),

    selfiePhoto: Yup.string()
        .required("Selfie photo is required"),
});

export const reasonModalSchema = Yup.object().shape({
    title: Yup.string()
        .min(30, "Title must be at least 30 characters")
        .max(40, "Title must be at most 40 characters")
        .required("Title is required"),

    description: Yup.string()
        .min(150, "Description must be at least 150 characters")
        .max(200, "Description must be at most 200 characters")
        .required("Description is required"),
});

export const MasterRWAStep1Schema = Yup.object().shape({
    assetType: Yup.string()
        .required('Asset type is required'),

    subType: Yup.string()
        .min(3, 'Asset sub-type must be at least 3 characters')
        .max(100, 'Asset sub-type cannot exceed 100 characters')
        .required('Asset sub-type is required'),

    assetTitle: Yup.string()
        .min(3, 'Asset title must be at least 3 characters')
        .max(100, 'Asset title cannot exceed 100 characters')
        .required('Asset title is required'),

    shortDescription: Yup.string()
        .min(50, 'Short description must be at least 50 characters')
        .max(200, 'Short description cannot exceed 200 characters')
        .required('Short description is required'),

    detailedDescription: Yup.string()
        .min(100, 'Detailed description must be at least 100 characters')
        .max(300, 'Detailed description cannot exceed 300 characters')
        .required('Detailed description is required'),

    building: Yup.string()
        .required('Building / Street / Plot Number is required'),

    landmark: Yup.string(),

    city: Yup.string()
        .required('City is required'),

    state: Yup.string()
        .required('State is required'),

    pincode: Yup.string()
        .matches(/^\d{6}$/, 'Pincode must be 6 digits')
        .required('Pincode is required'),

    country: Yup.string()
        .required('Country is required'),

    geoLocation: Yup.string()
        .matches(
            /^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/,
            'Geo Location must be in "latitude, longitude" format'
        )
        .required('Geo Location is required'),

    whyInvest: Yup.array()
        .ensure()
        .of(reasonModalSchema)
        .length(4, "You must add exactly 4 reasons")
        .required("Add reasons is required"),

    assetImages: Yup.array()
        .min(5, 'At least 5 asset image is required')
        .max(25, 'Maximum 25 images allowed')
        .of(
            Yup.object().shape({
                uri: Yup.string().required(),
                fileName: Yup.string(),
                type: Yup.string(),
            })
        ),

    assetVideos: Yup.array()
        .min(1, 'At least 1 asset video is required')
        .max(5, 'Maximum 5 videos allowed')
        .of(
            Yup.object().shape({
                uri: Yup.string().required(),
                fileName: Yup.string(),
                type: Yup.string(),
            })
        ),
});

export const MasterRWAStep2Schema = Yup.object().shape({
    ownershipModel: Yup.string()
        .required("Ownership model is required"),

    currentOwnerName: Yup.string()
        .trim()
        .min(2, "Owner name is too short")
        .required("Current owner name is required"),

    encumbranceDetails: Yup.string().nullable(),

    ownershipEntityType: Yup.string()
        .required("Ownership entity type is required"),

    titleStatus: Yup.string()
        .required("Title status is required"),

    reraNumber: Yup.string().nullable(),

    khasraNumber: Yup.string().nullable(),

    landArea: Yup.number()
        .typeError("Land area must be a number")
        .positive("Land area must be positive")
        .required("Land area is required"),

    builtupArea: Yup.number()
        .typeError("Built-up area must be a number")
        .positive("Built-up area must be positive")
        .nullable()
        .transform((value, originalValue) =>
            originalValue === "" ? null : value
        ),

    yearOfConstruction: Yup.number()
        .typeError("Year of construction must be a number")
        .min(1800, "Enter a valid year")
        .max(new Date().getFullYear(), "Year cannot be in the future")
        .required("Year of construction is required"),

    assetAge: Yup.number()
        .transform((value, originalValue) =>
            originalValue === "" ? undefined : value
        )
        .typeError("Asset age must be a number")
        .positive("Asset age must be positive")
        .notRequired(),

    titleDeed: Yup.mixed()
        .required("Title deed is required"),

    encumbranceCertificate: Yup.mixed()
        .required("Encumbrance certificate is required"),

    taxReceipt: Yup.mixed()
        .required("Tax receipt is required"),

    mutationRecords: Yup.mixed().nullable(),

    ownershipChainDocs: Yup.mixed()
        .required("Ownership chain documents are required"),

    reraCertificate: Yup.mixed().nullable(),

    selectedNocType: Yup.string()
        .required("Please select a NOC type"),

    nocDocument: Yup.mixed().when("selectedNocType", {
        is: (val: string) => !!val,
        then: schema => schema.required("NOC document is required"),
        otherwise: schema => schema.nullable(),
    }),
    occupancyCertificate: Yup.mixed()
        .required("Occupancy certificate is required"),

    completionCertificate: Yup.mixed()
        .required("Completion certificate is required"),

    electricityBill: Yup.mixed()
        .required("Electricity bill is required"),
});

export const MasterRWAStep3Schema = Yup.object().shape({
    marketValue: Yup.string()
        .required("Market value is required")
        .matches(/^\d+(\.\d{1,2})?$/, "Enter a valid amount (up to 2 decimal places)"),

    currency: Yup.string()
        .required("Currency is required"),

    valuationAgencyName: Yup.string()
        .required("Valuation agency name is required"),

    valuationReportDate: Yup.string()
        .required("Valuation report date is required"),

    lastPurchasePrice: Yup.string()
        .required("Last purchase price is required")
        .matches(/^\d+(\.\d{1,2})?$/, "Enter a valid amount (up to 2 decimal places)")
        .test(
            "positive",
            "Last purchase price must be positive",
            value => {
                if (!value) return false;
                return Number(value) > 0;
            }
        ),

    rentalIncomeMonthly: Yup.string()
        .required("Rental income monthly is required")
        .matches(/^\d+(\.\d{1,2})?$/, "Enter a valid amount (up to 2 decimal places)")
        .test(
            "non-negative",
            "Rental income cannot be negative",
            value => !!value && Number(value) >= 0
        ),

    leaseTenureRemainingMonth: Yup.number()
        .typeError("Lease tenure must be a number")
        .integer("Lease tenure must be a whole number")
        .min(0, "Lease tenure cannot be negative")
        .required("Lease tenure remaining is required"),

    threeYearRevenue: Yup.string()
        .required("Last 3 Year Revenue is required")
        .matches(/^\d+(\.\d{1,2})?$/, "Enter a valid amount (up to 2 decimal places)")
        .test(
            "non-negative",
            "Revenue cannot be negative",
            value => !!value && Number(value) >= 0
        ),

    operationalExpensesAnnual: Yup.string()
        .required("Operational expenses annual is required")
        .matches(/^\d+(\.\d{1,2})?$/, "Enter a valid amount (up to 2 decimal places)")
        .test(
            "non-negative",
            "Operational expenses cannot be negative",
            value => !!value && Number(value) >= 0
        ),

    netOperationalIncome: Yup.string()
        .required("Net operational income is required")
        .matches(/^\d+(\.\d{1,2})?$/, "Enter a valid amount (up to 2 decimal places)"),

    expectedYieldPercentage: Yup.number()
        .transform((value, originalValue) =>
            originalValue === "" ? null : value
        )
        .nullable()
        .typeError("Expected yield must be a number")
        .min(0, "Yield cannot be negative")
        .max(100, "Yield cannot exceed 100%"),

    expectedAppreciationPercentage: Yup.number()
        .transform((value, originalValue) =>
            originalValue === "" ? undefined : value
        )
        .typeError("Expected appreciation must be a number")
        .required("Expected appreciation is required")
        .min(0, "Appreciation cannot be negative")
        .max(100, "Appreciation cannot exceed 100%"),

    registeredValuationReport: Yup.mixed()
        .required("Registered valuation report is required"),

    rentalAgreement: Yup.mixed()
        .required("Rental agreement is required"),

    rentLedger: Yup.mixed()
        .required("Rent ledger is required"),

    projectedCashFlowStatement: Yup.mixed().nullable(),

    financialType: Yup.string()
        .required("Please select a financial type"),

    financialDocument: Yup.mixed().when("financialType", {
        is: (val: string) => !!val,
        then: (schema) =>
            schema.required("Financial document is required"),
        otherwise: (schema) => schema.nullable(),
    }),
});

export const MasterRWAStep4Schema = Yup.object().shape({
    storeType: Yup.string()
        .trim()
        .required("Store type is required"),

    brandAffiliation: Yup.string()
        .required("Brand affiliation is required"),

    averageMonthlySales: Yup.number()
        .typeError("Average monthly sales must be a number")
        .positive("Average monthly sales must be greater than 0")
        .required("Average monthly sales is required"),

    footFallData: Yup.number()
        .typeError("Foot fall data must be a number")
        .positive("Foot fall data must be greater than 0")
        .required("Foot fall data is required"),

    leaseRentPerMonth: Yup.number()
        .typeError("Lease rent per month must be a number")
        .positive("Lease rent per month must be greater than 0")
        .required("Lease rent per month is required"),

    staffCount: Yup.number()
        .typeError("Staff count must be a number")
        .integer("Staff count must be an integer")
        .min(1, "Staff count must be at least 1")
        .required("Staff count is required"),

    franchiseAgreement: Yup.mixed()
        .required("Franchise agreement is required"),

    businessLicense: Yup.mixed()
        .required("Business license is required"),

    gstReturns: Yup.mixed()
        .required("GST returns document is required"),

    salesReports: Yup.mixed()
        .required("Sales reports document is required"),
});

export const AssetOnboardingSchema = Yup.object().shape({
    ownerFirstName: Yup.string().required("First name is required"),

    ownerLastName: Yup.string().required("Last name is required"),

    ownerEmail: Yup.string()
        .email("Enter a valid email")
        .required("Email is required"),

    ownerMobile: Yup.string()
        .test(
            'valid-mobile',
            'Enter a valid mobile number',
            value => {
                if (!value) return false;
                if (value.startsWith('+91')) return /^\+91\d{10}$/.test(value);
                if (value.startsWith('+971')) return /^\+971\d{9}$/.test(value);
                return false;
            }
        )
        .required('Mobile number is required'),

    commission: Yup.string().required("Commission percentage is required"),

    note: Yup.string().optional(),
});

export const CreateNewReferralSchema = Yup.object().shape({
    referralFor: Yup.string().required("User type is required"),
    ownerName: Yup.string().required("Owner name is required"),
    ownerEmail: Yup.string()
        .email("Invalid email")
        .required("Owner email is required"),
    ownerMobile: Yup.string().nullable(),
});

export const AddVendorSuggestionSchema = Yup.object().shape({
    vendorName: Yup.string()
        .trim()
        .required("Vendor name is required"),

    category: Yup.string()
        .required("Category is required"),

    description: Yup.string()
        .nullable(),

    website: Yup.string()
        .url("Enter a valid website URL")
        .nullable()
        .notRequired(),

    email: Yup.string()
        .email("Enter a valid email")
        .required("Email is required"),

    mobile: Yup.string()
        .test(
            'valid-mobile',
            'Enter a valid mobile number',
            value => {
                if (!value) return false;
                if (value.startsWith('+91')) return /^\+91\d{10}$/.test(value);
                if (value.startsWith('+971')) return /^\+971\d{9}$/.test(value);
                return false;
            }
        )
        .required('Mobile number is required'),
});