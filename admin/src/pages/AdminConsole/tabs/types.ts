export interface ChatMessage {
  id: number;
  who: string;
  text: string;
  in: boolean;
}

export interface SPV {
  id: string;
  name: string;
  asset: string;
  fractions: string;
  status: string;
  step: number;
}

export interface Vote {
  id: string;
  title: string;
  asset: string;
  status: string;
  yes: number;
  no: number;
  daysLeft: number;
}

export interface ProfitMechanism {
  rental: boolean;
  timeshare: boolean;
  exit: boolean;
}

export interface Booking {
  id: string;
  guest: string;
  checkin: string;
  checkout: string;
  status: string;
  rate: number;
  total: number;
}

export interface AssetChecks {
  legal: boolean;
  valuation: boolean;
  dd: boolean;
  cms: boolean;
  owner: boolean;
}

export interface RelationshipManager {
  name: string;
  email: string;
  activeUsers: number;
  pendingKyc: number;
  workload: string;
}

export interface RmAssignment {
  user: string;
  role: string;
  rm: string;
}

export interface SupportTicket {
  id: string;
  user: string;
  subject: string;
  status: string;
  priority: string;
  date: string;
}

export interface ExitTimeline {
  votePassed: boolean;
  exitSpvTriggered: boolean;
  buyerFundsEscrowed: boolean;
  distributionReady: boolean;
}
