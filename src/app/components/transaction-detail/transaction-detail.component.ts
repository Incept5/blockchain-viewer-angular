import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Transaction } from '../../models/transaction.model';

@Component({
  selector: 'app-transaction-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="detail-container" *ngIf="transaction">
      <div class="detail-header">
        <div class="header-content">
          <span class="tx-type" [class]="transaction.certificateType?.name?.toLowerCase()">
            {{ transaction.certificateType?.name || 'Unknown' }}
          </span>
          <h2>Transaction Details</h2>
        </div>
        <button class="close-btn" (click)="onClose()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18"/>
            <path d="M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Tab Navigation -->
      <div class="tabs">
        <button
          *ngFor="let tab of tabs"
          class="tab"
          [class.active]="activeTab === tab.id"
          (click)="activeTab = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>

      <div class="detail-content">
        <!-- Overview Tab -->
        <div class="tab-content" *ngIf="activeTab === 'overview'">
          <div class="info-section">
            <h3>Transaction Info</h3>
            <div class="info-grid">
              <div class="info-item">
                <label>Transaction ID</label>
                <span class="mono copyable" (click)="copyToClipboard(transaction.transactionId)">
                  {{ transaction.transactionId }}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="9" y="9" width="13" height="13" rx="2"/>
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                  </svg>
                </span>
              </div>
              <div class="info-item">
                <label>Artifact ID</label>
                <span class="mono copyable" (click)="copyToClipboard(transaction.artifactId)">
                  {{ transaction.artifactId }}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="9" y="9" width="13" height="13" rx="2"/>
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                  </svg>
                </span>
              </div>
              <div class="info-item">
                <label>Created</label>
                <span>{{ formatDateTime(transaction.insertedAt) }}</span>
              </div>
              <div class="info-item">
                <label>State Change</label>
                <span class="state-badge">
                  {{ transaction.previousArtifactState }} → {{ transaction.newArtifactState }}
                </span>
              </div>
            </div>
          </div>

          <!-- KYC Specific Content -->
          <ng-container *ngIf="transaction.certificateType?.name === 'KYC' && transaction.data">
            <div class="info-section">
              <h3>Personal Information</h3>
              <div class="info-grid" *ngIf="transaction.data.personal_information as personal">
                <div class="info-item">
                  <label>Full Name</label>
                  <span>{{ personal.first_name }} {{ personal.middle_name }} {{ personal.last_name }}</span>
                </div>
                <div class="info-item">
                  <label>Date of Birth</label>
                  <span>{{ formatDate(personal.date_of_birth) }}</span>
                </div>
                <div class="info-item">
                  <label>Gender</label>
                  <span>{{ personal.gender }}</span>
                </div>
                <div class="info-item">
                  <label>Nationality</label>
                  <span class="flag-badge">{{ personal.nationality }}</span>
                </div>
                <div class="info-item" *ngIf="personal.place_of_birth">
                  <label>Place of Birth</label>
                  <span>
                    {{ personal.place_of_birth.city }}
                    {{ personal.place_of_birth.state_or_province ? ', ' + personal.place_of_birth.state_or_province : '' }},
                    {{ personal.place_of_birth.country }}
                  </span>
                </div>
              </div>
            </div>

            <div class="info-section" *ngIf="transaction.data.contact_information as contact">
              <h3>Contact Information</h3>
              <div class="info-grid">
                <div class="info-item" *ngIf="contact.email">
                  <label>Email</label>
                  <span>{{ contact.email }}</span>
                </div>
                <div class="info-item" *ngIf="contact.phone_number">
                  <label>Phone</label>
                  <span>{{ contact.phone_number }}</span>
                </div>
                <div class="info-item full-width" *ngIf="contact.address">
                  <label>Address</label>
                  <span>
                    {{ contact.address.street }}
                    {{ contact.address.apartment ? ', ' + contact.address.apartment : '' }},
                    {{ contact.address.city }}, {{ contact.address.state }} {{ contact.address.postal_code }},
                    {{ contact.address.country }}
                  </span>
                </div>
              </div>
            </div>

            <div class="info-section" *ngIf="transaction.data.identity_documents?.length > 0">
              <h3>Identity Documents</h3>
              <div class="documents-list">
                <div class="document-card" *ngFor="let doc of transaction.data.identity_documents">
                  <div class="doc-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="4" width="18" height="16" rx="2"/>
                      <circle cx="9" cy="10" r="2"/>
                      <path d="M15 8h2"/>
                      <path d="M15 12h2"/>
                      <path d="M7 16h10"/>
                    </svg>
                  </div>
                  <div class="doc-info">
                    <span class="doc-type">{{ doc.document_type }}</span>
                    <span class="doc-number">{{ doc.document_number }}</span>
                    <div class="doc-meta">
                      <span>{{ doc.issuing_country }}</span>
                      <span>•</span>
                      <span>Expires: {{ formatDate(doc.expiry_date) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="info-section" *ngIf="transaction.data.vault_documents?.length > 0">
              <h3>Vault Documents</h3>
              <div class="documents-list">
                <div class="document-card vault" *ngFor="let doc of transaction.data.vault_documents">
                  <div class="doc-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                  </div>
                  <div class="doc-info">
                    <span class="doc-type">{{ doc.document_title }}</span>
                    <span class="doc-number">{{ doc.document_filename }}</span>
                    <div class="doc-meta">
                      <span>{{ doc.document_mime_type }}</span>
                      <span>•</span>
                      <span class="mono">{{ doc.vault_id | slice:0:12 }}...</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ng-container>

          <!-- AUDIT Specific Content -->
          <ng-container *ngIf="transaction.certificateType?.name === 'AUDIT' && transaction.data">
            <div class="info-section">
              <h3>Audit Event</h3>
              <div class="audit-event">
                <div class="event-header">
                  <span class="event-type" [class]="getAuditOutcomeClass(transaction.data.additional_context)">
                    {{ transaction.data.action_name }}
                  </span>
                  <span class="event-data">{{ transaction.data.data }}</span>
                </div>
                <p class="event-context">{{ transaction.data.additional_context }}</p>
              </div>
            </div>

            <div class="info-section">
              <h3>Actor Details</h3>
              <div class="info-grid">
                <div class="info-item">
                  <label>Actor Name</label>
                  <span>{{ transaction.data.actor_name }}</span>
                </div>
                <div class="info-item">
                  <label>Actor ID</label>
                  <span class="mono">{{ transaction.data.actor_id }}</span>
                </div>
                <div class="info-item" *ngIf="transaction.data.actor_role">
                  <label>Role</label>
                  <span>{{ transaction.data.actor_role }}</span>
                </div>
                <div class="info-item">
                  <label>IP Address</label>
                  <span class="mono">{{ transaction.data.ip_address }}</span>
                </div>
                <div class="info-item" *ngIf="transaction.data.authentication_method">
                  <label>Auth Method</label>
                  <span>{{ transaction.data.authentication_method }}</span>
                </div>
                <div class="info-item">
                  <label>Execution Time</label>
                  <span>{{ formatDateTime(transaction.data.execution_datetime) }}</span>
                </div>
              </div>
            </div>

            <div class="info-section" *ngIf="transaction.data.action_id">
              <h3>Related Entity</h3>
              <div class="info-grid">
                <div class="info-item full-width">
                  <label>Action ID (KYC Reference)</label>
                  <span class="mono copyable" (click)="copyToClipboard(transaction.data.action_id)">
                    {{ transaction.data.action_id }}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="9" y="9" width="13" height="13" rx="2"/>
                      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          </ng-container>
        </div>

        <!-- Blockchain Tab -->
        <div class="tab-content" *ngIf="activeTab === 'blockchain'">
          <div class="info-section">
            <h3>Block Information</h3>
            <div class="info-grid">
              <div class="info-item full-width" *ngIf="transaction.blockSignature">
                <label>Block Signature</label>
                <span class="mono block-sig">{{ transaction.blockSignature }}</span>
              </div>
              <div class="info-item full-width" *ngIf="transaction.previousBlockSignature">
                <label>Previous Block Signature</label>
                <span class="mono block-sig">{{ transaction.previousBlockSignature }}</span>
              </div>
              <div class="info-item" *ngIf="transaction.previousTransactionId">
                <label>Previous Transaction ID</label>
                <span class="mono">{{ transaction.previousTransactionId }}</span>
              </div>
            </div>
          </div>

          <div class="info-section">
            <h3>Type Information</h3>
            <div class="info-grid">
              <div class="info-item">
                <label>Certificate Type</label>
                <span>{{ transaction.certificateType?.name }}</span>
              </div>
              <div class="info-item full-width">
                <label>Description</label>
                <span>{{ transaction.certificateType?.description }}</span>
              </div>
              <div class="info-item">
                <label>Artifact Type</label>
                <span>{{ transaction.artifactType?.name }}</span>
              </div>
              <div class="info-item full-width">
                <label>Description</label>
                <span>{{ transaction.artifactType?.description }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Raw JSON Tab -->
        <div class="tab-content" *ngIf="activeTab === 'raw'">
          <div class="raw-json">
            <div class="json-header">
              <span>Raw Transaction Data</span>
              <button class="copy-btn" (click)="copyToClipboard(getFormattedJson())">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2"/>
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                </svg>
                Copy
              </button>
            </div>
            <pre><code>{{ getFormattedJson() }}</code></pre>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .detail-container {
      background: var(--bg-secondary);
      border: 1px solid var(--border-primary);
      border-radius: 12px;
      height: 100%;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transition: background-color 0.3s ease, border-color 0.3s ease;
    }

    .detail-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.25rem;
      border-bottom: 1px solid var(--border-primary);
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 0.75rem;

      h2 {
        margin: 0;
        font-size: 1rem;
        font-weight: 600;
        color: var(--text-primary);
      }
    }

    .tx-type {
      font-size: 0.6875rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 4px 10px;
      border-radius: 4px;
      background: rgba(139, 148, 158, 0.15);
      color: var(--text-tertiary);

      &.kyc {
        background: rgba(56, 211, 159, 0.15);
        color: var(--accent-green);
      }

      &.audit {
        background: rgba(88, 166, 255, 0.15);
        color: var(--accent-blue);
      }
    }

    .close-btn {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: none;
      border-radius: 6px;
      color: var(--text-tertiary);
      cursor: pointer;
      transition: all 0.2s ease;

      svg {
        width: 18px;
        height: 18px;
      }

      &:hover {
        background: var(--input-bg);
        color: var(--text-primary);
      }
    }

    .tabs {
      display: flex;
      gap: 0.25rem;
      padding: 0.5rem 1rem;
      border-bottom: 1px solid var(--border-primary);
    }

    .tab {
      padding: 8px 16px;
      background: transparent;
      border: none;
      border-radius: 6px;
      color: var(--text-tertiary);
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: var(--input-bg);
        color: var(--text-secondary);
      }

      &.active {
        background: var(--bg-tertiary);
        color: var(--text-primary);
      }
    }

    .detail-content {
      flex: 1;
      overflow-y: auto;
      padding: 1rem;

      &::-webkit-scrollbar {
        width: 8px;
      }

      &::-webkit-scrollbar-track {
        background: transparent;
      }

      &::-webkit-scrollbar-thumb {
        background: var(--scrollbar-thumb);
        border-radius: 4px;

        &:hover {
          background: var(--scrollbar-thumb-hover);
        }
      }
    }

    .tab-content {
      animation: fadeIn 0.2s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .info-section {
      margin-bottom: 1.5rem;

      h3 {
        margin: 0 0 0.75rem;
        font-size: 0.8125rem;
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }

    .info-item {
      background: var(--bg-tertiary);
      padding: 0.875rem;
      border-radius: 8px;
      transition: background-color 0.3s ease;

      &.full-width {
        grid-column: 1 / -1;
      }

      label {
        display: block;
        font-size: 0.6875rem;
        font-weight: 500;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 4px;
      }

      span {
        display: block;
        font-size: 0.875rem;
        color: var(--text-secondary);
        word-break: break-all;
      }
    }

    .mono {
      font-family: 'SF Mono', Monaco, 'Courier New', monospace;
      font-size: 0.8125rem !important;
    }

    .copyable {
      display: flex !important;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      transition: color 0.2s ease;

      svg {
        width: 14px;
        height: 14px;
        opacity: 0.5;
        flex-shrink: 0;
      }

      &:hover {
        color: var(--accent-blue);

        svg {
          opacity: 1;
        }
      }
    }

    .state-badge {
      display: inline-flex !important;
      align-items: center;
      padding: 4px 10px;
      background: rgba(88, 166, 255, 0.1);
      border-radius: 4px;
      font-family: 'SF Mono', Monaco, 'Courier New', monospace;
      font-size: 0.8125rem !important;
      color: var(--accent-blue) !important;
    }

    .flag-badge {
      display: inline-flex !important;
      align-items: center;
      padding: 4px 10px;
      background: rgba(56, 211, 159, 0.1);
      border-radius: 4px;
      font-weight: 500;
      color: var(--accent-green) !important;
    }

    .documents-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .document-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: var(--bg-tertiary);
      border: 1px solid var(--border-primary);
      border-radius: 10px;
      transition: border-color 0.2s ease;

      &:hover {
        border-color: var(--border-hover);
      }

      &.vault {
        .doc-icon {
          background: rgba(210, 153, 34, 0.1);
          color: var(--accent-yellow);
        }
      }
    }

    .doc-icon {
      width: 44px;
      height: 44px;
      background: rgba(88, 166, 255, 0.1);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--accent-blue);
      flex-shrink: 0;

      svg {
        width: 22px;
        height: 22px;
      }
    }

    .doc-info {
      flex: 1;
      min-width: 0;

      .doc-type {
        display: block;
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--text-primary);
        margin-bottom: 2px;
      }

      .doc-number {
        display: block;
        font-family: 'SF Mono', Monaco, 'Courier New', monospace;
        font-size: 0.8125rem;
        color: var(--text-tertiary);
        margin-bottom: 4px;
      }

      .doc-meta {
        display: flex;
        gap: 6px;
        font-size: 0.75rem;
        color: var(--text-muted);
      }
    }

    .audit-event {
      background: var(--bg-tertiary);
      border-radius: 10px;
      padding: 1rem;
      transition: background-color 0.3s ease;
    }

    .event-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.75rem;
    }

    .event-type {
      font-size: 0.75rem;
      font-weight: 600;
      padding: 4px 10px;
      border-radius: 4px;
      background: rgba(139, 148, 158, 0.15);
      color: var(--text-tertiary);

      &.success {
        background: rgba(56, 211, 159, 0.15);
        color: var(--accent-green);
      }

      &.failure {
        background: rgba(248, 81, 73, 0.15);
        color: var(--accent-red);
      }
    }

    .event-data {
      font-size: 0.8125rem;
      color: var(--accent-blue);
      font-weight: 500;
    }

    .event-context {
      margin: 0;
      font-size: 0.875rem;
      color: var(--text-secondary);
      line-height: 1.5;
    }

    .block-sig {
      font-size: 0.75rem !important;
      word-break: break-all;
      line-height: 1.6;
    }

    .raw-json {
      background: var(--bg-primary);
      border: 1px solid var(--border-primary);
      border-radius: 10px;
      overflow: hidden;
      transition: background-color 0.3s ease, border-color 0.3s ease;
    }

    .json-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 1rem;
      background: var(--bg-secondary);
      border-bottom: 1px solid var(--border-primary);

      span {
        font-size: 0.8125rem;
        font-weight: 500;
        color: var(--text-tertiary);
      }
    }

    .copy-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      background: var(--input-bg);
      border: 1px solid var(--border-primary);
      border-radius: 6px;
      color: var(--text-tertiary);
      font-size: 0.75rem;
      cursor: pointer;
      transition: all 0.2s ease;

      svg {
        width: 14px;
        height: 14px;
      }

      &:hover {
        background: var(--input-bg-focus);
        color: var(--text-primary);
      }
    }

    pre {
      margin: 0;
      padding: 1rem;
      overflow-x: auto;

      code {
        font-family: 'SF Mono', Monaco, 'Courier New', monospace;
        font-size: 0.75rem;
        color: var(--text-secondary);
        white-space: pre-wrap;
        word-break: break-all;
      }
    }

    @media (max-width: 768px) {
      .info-grid {
        grid-template-columns: 1fr;
      }

      .info-item.full-width {
        grid-column: 1;
      }
    }
  `]
})
export class TransactionDetailComponent {
  @Input() transaction: Transaction | null = null;
  @Output() close = new EventEmitter<void>();

  activeTab = 'overview';

  tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'blockchain', label: 'Blockchain' },
    { id: 'raw', label: 'Raw JSON' }
  ];

  onClose(): void {
    this.close.emit();
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  formatDateTime(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  getAuditOutcomeClass(context: string): string {
    if (!context) return '';
    const lower = context.toLowerCase();
    if (lower.includes('success')) return 'success';
    if (lower.includes('failure') || lower.includes('failed')) return 'failure';
    return '';
  }

  getFormattedJson(): string {
    if (!this.transaction) return '';
    return JSON.stringify(this.transaction, null, 2);
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      // Could add a toast notification here
    }).catch(err => {
      console.error('Failed to copy:', err);
    });
  }
}
