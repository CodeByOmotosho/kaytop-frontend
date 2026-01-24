import { Meta } from "./dashboard";

export enum ReportStatus {
  DRAFT = "draft",
  SUBMITTED = "submitted",
  FORWARDED = "forwarded",
  APPROVED = "approved",
  DECLINED = "declined",
  PENDING = "pending",
}


export enum AccountStatus {
  FULLY_VERIFIED = "fully_verified",
}

export enum VerificationStatus {
  VERIFIED = "verified",
}

export enum UserRole {
  BRANCH_MANAGER = "branch_manager",
  CREDIT_OFFICER = "credit_officer",
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  role: UserRole;
  branch: string;
  state: string;

  accountStatus: AccountStatus;
  verificationStatus: VerificationStatus;
  isVerified: boolean;

  profilePicture: string | null;

  address: string | null;
  dob: string | null;

  idType: string | null;
  idNumber: string | null;
  idPicture: string | null;

  guarantorName: string | null;
  guarantorEmail: string | null;
  guarantorPhone: string | null;
  guarantorAddress: string | null;
  guarantorPicture: string | null;

  createdAt: string;
  createdAtBy: string;
  updatedAt: string | null;
  verifiedAt: string | null;
}

export type ReportType =
  | "daily"
  | "weekly"
  | "monthly"
  | "quarterly"
  | "annual"
  | "custom";

  export interface WorkflowItem {
  action: string;
  userId: number;
  userName: string;
  timestamp: string;
  comment: string;
  assignedTo?: {
    id: number;
    name: string;
    role: string;
  };
}


export interface Report {
  id: number;
  title: string;
  description: string;
  type: ReportType;

  branch: string;
  state: string;

  startDate: string;
  endDate: string;
  reportDate: string;

  status: ReportStatus;
  declineReason: string | null;
  remarks: string | null;

  totalLoansProcessed: number;
  totalLoansDisbursed: string;
  totalRecollections: string;
  totalSavingsProcessed: string;

  submittedAt: string;
  submittedBy: User;

  reviewedBy: User;

  createdAt: string;
  updatedAt: string;
  workflowHistory?: WorkflowItem[] | null;

}

export interface ReportApiResponse {
  page: number;
  reports: Report[];
  total: number;
  totalPages: number;
}

export interface ReportResponse {
  data: Report[];
  meta?: Meta;
}

export interface ReportById {
  id: number;
  title: string;
  description: string;

  branch: string;
  state: string;

  startDate: string;
  endDate: string;
  reportDate: string;

  status: ReportStatus;
  type: ReportType;

  declineReason: string | null;
  remarks: string | null;

  totalLoansProcessed: number;
  totalLoansDisbursed: string;
  totalRecollections: string;
  totalSavingsProcessed: string;

  submittedAt: string;
  updatedAt: string;

  submittedBy: User;
  reviewedBy: User;
  createdAt: string;
  workflowHistory?: WorkflowItem[] | null;
  
}

export type CreateReportResponse = Report;

export interface ApproveFormData {
  remarks: string;
}

export interface ReportByIdResponse {
  data: ReportById;
}

export interface CreateReportPayload {
  title: string;
  description: string;
  type: ReportType;
  reportDate: string; // ISO date string
  startDate: string;  // ISO date string
  endDate: string;    // ISO date string
}

export interface SubmitReportPayload {
  remarks?: string;
}

export interface SubmittedBy {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  address: string | null;
  role: string;
  dob: string | null;
  isVerified: boolean;
  accountStatus: string;
  profilePicture: string | null;
  state: string;
  branch: string;
  guarantorName: string | null;
  guarantorEmail: string | null;
  guarantorPhone: string | null;
  guarantorAddress: string | null;
  guarantorPicture: string | null;
  idType: string | null;
  idNumber: string | null;
  idPicture: string | null;
  verificationStatus: string;
  createdAt: string;
  updatedAt: string | null;
  verifiedAt: string | null;
  createdAtBy: string;
}

export interface ReportListItem {
  id: number;
  title: string;
  description: string;
  type: ReportType;

  branch: string;
  state: string;

  startDate: string;
  endDate: string;
  reportDate: string;

  status: ReportStatus;
  declineReason: string | null;
  remarks: string | null;

  totalLoansProcessed: number;
  totalLoansDisbursed: string;
  totalRecollections: string;
  totalSavingsProcessed: string;

  submittedAt: string;
  submittedBy: User;

  reviewedBy: User;

  createdAt: string;
  updatedAt: string;
  workflowHistory?: WorkflowItem[] | null;
}
