export type ReferralType = 'asset' | 'investor';

export type ReferralStep = 1 | 2;

export interface ReferralPayload {
  referralType: ReferralType;
  name: string;
  email: string;
  mobile?: string;
}
