export enum VoteStatus {
  Scheduled = 'Scheduled',
  Active = 'Active',
  Ended = 'Ended',
}

export function getVoteStatus(
  startDate: Date,
  endDate: Date,
  now: Date = new Date(),
): VoteStatus {
  if (now < startDate) return VoteStatus.Scheduled;
  if (now > endDate) return VoteStatus.Ended;
  return VoteStatus.Active;
}

export function getVoteStatusMessage(
  status: VoteStatus,
  startDate: Date,
): string | null {
  switch (status) {
    case VoteStatus.Scheduled:
      return `Voting will start on ${startDate.toISOString()}.`;
    case VoteStatus.Ended:
      return 'Voting has ended.';
    default:
      return null;
  }
}
