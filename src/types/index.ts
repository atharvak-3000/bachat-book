import { Member, Organization, Meeting, MeetingContribution, Loan } from "@prisma/client";

export type MemberWithOrg = Member & { 
  organization: Organization 
};

export type MeetingWithContributions = Meeting & { 
  contributions: (MeetingContribution & { 
    member: Member 
  })[] 
};

export type LoanWithMember = Loan & { 
  member: Member 
};

export type ContributionWithMember = MeetingContribution & { 
  member: Member 
};

export type MemberFull = Member & {
  contributions: MeetingContribution[];
  loans: Loan[];
};
