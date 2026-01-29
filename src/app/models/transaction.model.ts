export interface TransactionType {
  id: string;
  name: string;
  description: string;
}

export interface Transaction {
  transactionId: string;
  artifactId: string;
  certificateType: TransactionType;
  artifactType: TransactionType;
  previousTransactionId: string | null;
  previousArtifactState: number;
  newArtifactState: number;
  insertedAt: string;
  dataPreview: string;
  data: any;
  relatedTransactions?: Transaction[];
  blockSignature?: string;
  previousBlockSignature?: string;
}

export interface TransactionsResponse {
  items: Transaction[];
  totalCount?: number;
  page?: number;
  pageSize?: number;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  expiresAt: string;
}

export interface PersonalInformation {
  first_name: string;
  middle_name?: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  nationality: string;
  place_of_birth?: {
    city: string;
    state_or_province?: string;
    country: string;
  };
}

export interface ContactInformation {
  email: string;
  phone_number: string;
  alternate_phone_number?: string;
  address?: {
    street: string;
    apartment?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
}

export interface IdentityDocument {
  document_type: string;
  document_number: string;
  issuing_country: string;
  issuing_authority?: string;
  issue_date: string;
  expiry_date: string;
}

export interface VaultDocument {
  vault_id: string;
  document_id: string;
  document_title: string;
  document_filename: string;
  document_mime_type: string;
  document_signature: string;
}

export interface KYCData {
  request_id: string;
  created_date: string;
  personal_information: PersonalInformation;
  contact_information: ContactInformation;
  identity_documents: IdentityDocument[];
  vault_documents?: VaultDocument[];
}

export interface AuditData {
  data: string;
  action_name: string;
  action_id: string;
  actor_name: string;
  actor_id: string;
  actor_role: string | null;
  ip_address: string;
  execution_datetime: string;
  authentication_method: string | null;
  additional_context: string;
  created_date: string;
}

export interface TransactionStats {
  total: number;
  kyc: number;
  audit: number;
  other: number;
}
