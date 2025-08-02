export const primaryIdTypes = [
  "NATIONAL_ID",
  "PASSPORT",
  "DRIVERS_LICENSE",
  "UMID",
  "SSS_ID",
  "GSIS_ID",
  "PRC_ID",
  "POSTAL_ID",
  "PHILHEALTH_ID",
  "VOTERS_ID",
  "SENIOR_CITIZEN_ID",
  "PWD_ID",
  "INTEGRATED_BAR_ID",
  "OFW_ID",
] as const;

export const secondaryIdTypes = [
  "BARANGAY_ID",
  "POLICE_CLEARANCE",
  "NBI_CLEARANCE",
  "BIRTH_CERTIFICATE",
  "TIN_ID",
  "PAGIBIG_ID",
  "COMPANY_ID",
  "SCHOOL_ID",
  "POSTAL_ID",
  "BRGY_CLEARANCE",
  "CEDULA",
  "INSURANCE_ID",
  "BIR_ID",
  "OWWA_ID",
  "MARINA_ID",
] as const;




export interface BorrowerSignInResponse {
  success: boolean;
  message: string;
  idToken?: string;
  customToken?: string;
  user?: {
    uid: string;
    email: string;
    fullName: string;
    username: string;
    phoneNumber: string;
    address: string;
    identification: {
      hasValidId: boolean;
      validIdType: string;
      validIdNumber: string;
      validIdFile: string;
      secondaryIdType1: string;
      secondaryIdFile1: string;
      secondaryIdType2: string;
      secondaryIdFile2: string;
    };
    role: 'borrower';
  };
}




export interface SignInCredentials {
  email: string;
  password: string;
}


export
  interface BorrowerSignUpResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      id: string;
      email: string;
      fullName: string;
      // Add other expected user fields
    };
    tokens?: {
      accessToken: string;
      refreshToken: string;
    };
  };
}

export interface BorrowerSignUpError {
  message: string;
  errors?: Record<string, string[]>;
}



export interface BorrowerProfileResponse {
  status: "success";
  code: "PERSONAL_INFO_UPDATED";
  message: string;
  data: {
    user: {
      uid: string;
      username: string;
      email: string;
      phone_number: string;
      full_name: string;
      first_name: string;
      middle_name: string | null;
      last_name: string;
      bio: string | null;
      street: string | null;
      barangay: string | null;
      zip_code: string | null;
      country: string;
      region: string | null;
      province: string | null;
      city: {
        id: string;
        name: string;
      } | null;
      updated_at: string;
    };
  };
}


export interface BorrowerPersonalInfoFormDataType {
  first_name: string;
  middle_name: string;
  last_name: string;
  username: string;
  email: string;
  phone_number: string;
  bio: string;
  street: string;
  barangay: string;
  zip_code: string;
  country: string;
  region: string;
  province: string;
  city: {
    id: string;
    name: string;
  };
}
