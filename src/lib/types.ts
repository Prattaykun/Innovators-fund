export type MemberRole = 'admin' | 'member';

export interface Member {
  id: string;
  name: string;
  role: MemberRole;
  password_hash?: string;
  direct_token: string;
  token_used?: boolean;
  email: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FundSettings {
  id: number;
  total_initial_amount: number;
  currency: string;
  updated_at: string;
}

export type RequestStatus = 'pending' | 'approved' | 'rejected';

export interface FundRequest {
  id: string;
  requested_by: string;
  requester?: {
    id: string;
    name: string;
    email: string | null;
    role: MemberRole;
  };
  title: string;
  amount: number;
  reason: string;
  category: string;
  status: RequestStatus;
  reviewed_by: string | null;
  reviewer?: {
    id: string;
    name: string;
  } | null;
  admin_notes: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export type AuditActionType =
  | 'INITIAL_POOL_CREATED'
  | 'REQUEST_CREATED'
  | 'REQUEST_APPROVED'
  | 'REQUEST_REJECTED'
  | 'PASSWORD_CHANGED'
  | 'EMAIL_UPDATED'
  | 'MEMBER_INVITED'
  | 'MEMBER_STATUS_CHANGED';

export interface AuditLog {
  id: string;
  action_type: AuditActionType;
  actor_id: string;
  actor_name: string;
  request_id: string | null;
  amount: number | null;
  balance_before: number;
  balance_after: number;
  details: Record<string, any> | string;
  created_at: string;
}

export interface FundMetrics {
  totalInitial: number;
  totalApproved: number;
  availableBalance: number;
  pendingAmount: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
}
