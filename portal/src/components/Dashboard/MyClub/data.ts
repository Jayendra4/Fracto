export type PrimaryClub = {
  id: number;
  name: string;
  members: number;
  assetsUnderReview: number;
  status: 'Live' | 'Review';
};

export type Proposal = {
  id: number;
  title: string;
  description: string;
  deadline: string;
  yesVotes: number;
  noVotes: number;
};

export type SecondaryClub = {
  id: number;
  club: string;
  asset: string;
  members: number;
  activeVotes: number;
  status: 'Live' | 'Voting';
  location: string;
  proposals: Proposal[];
};

export type TimelineStep = {
  label: string;
  date: string;
  state: 'done' | 'current' | 'upcoming';
};

export type ClubDetail = {
  id: number;
  asset: string;
  city: string;
  clubName: string;
  focus: string;
  stage: string;
  members: number;
  assetsUnderReviewLabel: string;
  about: string;
  timeline: TimelineStep[];
  votingClosesOn: string;
  yesThresholdPct: number;
  votedSoFar: number;
  teaser: {
    assetType: string;
    city: string;
    indicativeValue: string;
    targetRaise: string;
    profitTypes: string[];
    profitNote: string;
    description: string;
  };
  dueDiligence: { name: string; available: boolean }[];
  dueDiligenceNote: string;
  financials: { label: string; value: string }[];
  financialsDisclaimer: string;
};

export const clubDetails: ClubDetail[] = [
  {
    id: 1,
    asset: 'Residential Complex Aurora',
    city: 'Indore',
    clubName: 'Mumbai Residential Collective',
    focus: 'Residential Real Estate, Mumbai & Indore',
    stage: 'Club Review (pre-commitment)',
    members: 128,
    assetsUnderReviewLabel: '1 (Residential Complex Aurora)',
    about:
      'A Primary Club for identified investors interested in residential real estate across Mumbai and Indore. The club exists to review assets introduced by House of Frac, ask questions before deciding, and vote on whether to proceed toward a Secondary Club and SPV structuring for a specific asset. Membership requires completed KYC. Voting follows a simple majority Yes threshold of 60% to form a Secondary Club. All members are bound by the Investment Club Membership Agreement.',
    timeline: [
      { label: 'Notice Sent', date: '10 Jun', state: 'done' },
      { label: 'Discussion Opened', date: '12 Jun', state: 'done' },
      { label: 'Vote Opened', date: '21 Jun', state: 'current' },
      { label: 'Vote Closed', date: '28 Jun', state: 'upcoming' },
      { label: 'Result Declared', date: '29 Jun', state: 'upcoming' },
      { label: 'Minutes Published', date: '30 Jun', state: 'upcoming' },
    ],
    votingClosesOn: '28 Jun 2026',
    yesThresholdPct: 60,
    votedSoFar: 61,
    teaser: {
      assetType: 'Residential',
      city: 'Indore',
      indicativeValue: '₹8.5–9.2Cr',
      targetRaise: '₹3.6Cr',
      profitTypes: ['Rental', 'Sale'],
      profitNote: 'This asset is tagged for Rental Distribution.',
      description:
        'Gated residential complex near the city centre, currently under valuation and legal review. Exact address, ownership documents, and title records are withheld at this stage per platform access controls.',
    },
    dueDiligence: [
      { name: 'DD Summary Report (Stage 1)', available: true },
      { name: 'Indicative Valuation Range Note', available: true },
    ],
    dueDiligenceNote:
      'Title deed, encumbrance certificate, and lease documents are not available at Primary Club stage. These unlock only in the Secondary Club after commitment.',
    financials: [
      { label: 'Indicative Rental Yield (gross)', value: '8.4%' },
      { label: 'Indicative Rental Yield (net)', value: '6.7%' },
      { label: 'Indicative Sale Profit Range (at exit)', value: '16–22%' },
      { label: 'Indicative IRR Range', value: '12–15%' },
    ],
    financialsDisclaimer:
      'Indicative only — not guaranteed. Subject to legal & valuation review.',
  },
  {
    id: 2,
    asset: 'Tech Park Orion',
    city: 'Bengaluru',
    clubName: 'Bengaluru Commercial Circle',
    focus: 'Commercial Real Estate, Bengaluru',
    stage: 'Secondary Club (live)',
    members: 86,
    assetsUnderReviewLabel: '0',
    about:
      'A Secondary Club formed after successful Primary Club approval. Members hold committed interest in the underlying SPV for this asset and receive periodic distribution and governance updates.',
    timeline: [
      { label: 'Notice Sent', date: '2 May', state: 'done' },
      { label: 'Discussion Opened', date: '4 May', state: 'done' },
      { label: 'Vote Opened', date: '10 May', state: 'done' },
      { label: 'Vote Closed', date: '17 May', state: 'done' },
      { label: 'Result Declared', date: '18 May', state: 'done' },
      { label: 'Minutes Published', date: '20 May', state: 'done' },
    ],
    votingClosesOn: '17 May 2026',
    yesThresholdPct: 60,
    votedSoFar: 86,
    teaser: {
      assetType: 'Commercial',
      city: 'Bengaluru',
      indicativeValue: '₹22–24Cr',
      targetRaise: '₹9.5Cr',
      profitTypes: ['Rental'],
      profitNote: 'This asset is tagged for Rental Distribution.',
      description:
        'Grade-A tech park office space fully leased to an IT tenant on a long-term lock-in. Fully onboarded — the SPV is live and distributing rental income to Secondary Club members.',
    },
    dueDiligence: [
      { name: 'DD Summary Report (Final)', available: true },
      { name: 'Title Deed & Encumbrance Certificate', available: true },
      { name: 'Lease Agreement', available: true },
    ],
    dueDiligenceNote:
      'All documents unlocked — this asset has completed Secondary Club formation.',
    financials: [
      { label: 'Rental Yield (gross)', value: '9.1%' },
      { label: 'Rental Yield (net)', value: '7.4%' },
      { label: 'Sale Profit Range (at exit)', value: '20–26%' },
      { label: 'IRR Range', value: '13–16%' },
    ],
    financialsDisclaimer:
      'Based on trailing 6-month distributions — actuals may vary.',
  },
  {
    id: 3,
    asset: 'Beachside Resort Villa',
    city: 'Goa',
    clubName: 'Goa Hospitality Group',
    focus: 'Hospitality Real Estate, Goa',
    stage: 'Club Review (pre-commitment)',
    members: 54,
    assetsUnderReviewLabel: '1 (Beachside Resort Villa)',
    about:
      'A Primary Club for identified investors interested in hospitality real estate across Goa. The club exists to review assets introduced by House of Frac, ask questions before deciding, and vote on whether to proceed toward a Secondary Club and SPV structuring for a specific asset. Membership requires completed KYC. Voting follows a simple majority Yes threshold of 60% to form a Secondary Club.',
    timeline: [
      { label: 'Notice Sent', date: '15 Jun', state: 'done' },
      { label: 'Discussion Opened', date: '17 Jun', state: 'done' },
      { label: 'Vote Opened', date: '25 Jun', state: 'current' },
      { label: 'Vote Closed', date: '2 Jul', state: 'upcoming' },
      { label: 'Result Declared', date: '3 Jul', state: 'upcoming' },
      { label: 'Minutes Published', date: '4 Jul', state: 'upcoming' },
    ],
    votingClosesOn: '2 Jul 2026',
    yesThresholdPct: 60,
    votedSoFar: 22,
    teaser: {
      assetType: 'Hospitality',
      city: 'Candolim, Goa',
      indicativeValue: '₹11.8–12.6Cr',
      targetRaise: '₹5.2Cr',
      profitTypes: ['Timeshare', 'Sale'],
      profitNote: 'This asset is not tagged for Rental Distribution.',
      description:
        'Beachfront resort villa near the city centre, currently under valuation and legal review. Exact address, ownership documents, and title records are withheld at this stage per platform access controls.',
    },
    dueDiligence: [
      { name: 'DD Summary Report (Stage 1)', available: true },
      { name: 'Indicative Valuation Range Note', available: true },
    ],
    dueDiligenceNote:
      'Title deed, encumbrance certificate, and lease documents are not available at Primary Club stage. These unlock only in the Secondary Club after commitment.',
    financials: [
      { label: 'Indicative Timeshare Yield (gross)', value: '7.8%' },
      { label: 'Indicative Timeshare Yield (net)', value: '6.1%' },
      { label: 'Indicative Sale Profit Range (at exit)', value: '18–24%' },
      { label: 'Indicative IRR Range', value: '11–14%' },
    ],
    financialsDisclaimer:
      'Indicative only — not guaranteed. Subject to legal & valuation review. No Rental Distribution applies to this asset.',
  },
];

export const primaryClubs: PrimaryClub[] = [
  {
    id: 1,
    name: 'Mumbai Residential Collective',
    members: 128,
    assetsUnderReview: 2,
    status: 'Review',
  },
  {
    id: 2,
    name: 'Bengaluru Commercial Circle',
    members: 86,
    assetsUnderReview: 0,
    status: 'Live',
  },
  {
    id: 3,
    name: 'Goa Hospitality Group',
    members: 54,
    assetsUnderReview: 1,
    status: 'Review',
  },
  {
    id: 4,
    name: 'Delhi NCR Office Spaces',
    members: 97,
    assetsUnderReview: 0,
    status: 'Live',
  },
];

export const secondaryClubs: SecondaryClub[] = [
  {
    id: 1,
    club: 'Mumbai Residential Collective',
    asset: 'Residential Complex Aurora',
    members: 128,
    activeVotes: 1,
    status: 'Voting',
    location: 'MR-10 Indore, MP, India',
    proposals: [
      {
        id: 1,
        title: 'Approve Q3 maintenance budget',
        description:
          'Vote to approve the proposed maintenance and upkeep budget for the asset for the upcoming quarter.',
        deadline: '2026-08-10',
        yesVotes: 62,
        noVotes: 18,
      },
    ],
  },
  {
    id: 2,
    club: 'Bengaluru Commercial Circle',
    asset: 'Tech Park Orion',
    members: 86,
    activeVotes: 0,
    status: 'Live',
    location: 'Whitefield, Bengaluru, India',
    proposals: [],
  },
  {
    id: 3,
    club: 'Goa Hospitality Group',
    asset: 'Beachside Resort Villa',
    members: 54,
    activeVotes: 2,
    status: 'Voting',
    location: 'Candolim, Goa, India',
    proposals: [
      {
        id: 1,
        title: 'Renew hospitality management contract',
        description:
          'Vote on renewing the current hospitality management contract for another 12 months.',
        deadline: '2026-08-02',
        yesVotes: 40,
        noVotes: 22,
      },
      {
        id: 2,
        title: 'Approve exterior renovation proposal',
        description:
          'Vote to approve the proposed exterior renovation and landscaping upgrade for the property.',
        deadline: '2026-08-15',
        yesVotes: 33,
        noVotes: 11,
      },
    ],
  },
];
