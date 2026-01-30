import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Transaction } from '../../models/transaction.model';

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="transaction-list-container">
      <div class="list-header">
        <h2>Transactions</h2>
        <span class="count">
          <ng-container *ngIf="isFiltered">
            {{ transactions.length }} of {{ totalCount }}
          </ng-container>
          <ng-container *ngIf="!isFiltered">
            {{ transactions.length }} records
          </ng-container>
        </span>
      </div>

      <div class="loading-overlay" *ngIf="loading">
        <div class="spinner"></div>
        <span>Loading transactions...</span>
      </div>

      <div class="transaction-list" *ngIf="!loading">
        <div
          *ngFor="let tx of transactions; trackBy: trackByFn"
          class="transaction-item"
          [class.selected]="tx.transactionId === selectedId"
          [class.kyc]="tx.certificateType?.name === 'KYC'"
          [class.audit]="tx.certificateType?.name === 'AUDIT'"
          (click)="onSelect(tx)"
        >
          <div class="tx-indicator"></div>

          <div class="tx-content">
            <div class="tx-header">
              <span class="tx-type" [class]="tx.certificateType?.name?.toLowerCase()">
                {{ tx.certificateType?.name || 'Unknown' }}
              </span>
              <span class="tx-time">{{ formatDate(tx.insertedAt) }}</span>
            </div>

            <div class="tx-id">{{ tx.transactionId }}</div>

            <div class="tx-preview">{{ getPreviewText(tx) }}</div>

            <div class="tx-meta">
              <span class="artifact-id" title="Artifact ID">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
                </svg>
                {{ tx.artifactId | slice:0:8 }}...
              </span>
              <span class="state-change" *ngIf="tx.previousArtifactState !== tx.newArtifactState">
                {{ tx.previousArtifactState }} → {{ tx.newArtifactState }}
              </span>
            </div>
          </div>

          <div class="tx-arrow">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </div>
        </div>

        <div class="empty-state" *ngIf="transactions.length === 0">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M8 15h8"/>
            <path d="M9 9h.01"/>
            <path d="M15 9h.01"/>
          </svg>
          <p>No transactions found</p>
          <span>Try adjusting your filters or search term</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .transaction-list-container {
      background: var(--bg-secondary);
      border: 1px solid var(--border-primary);
      border-radius: 12px;
      height: 100%;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transition: background-color 0.3s ease, border-color 0.3s ease;
    }

    .list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.25rem;
      border-bottom: 1px solid var(--border-primary);
      flex-shrink: 0;

      h2 {
        margin: 0;
        font-size: 1rem;
        font-weight: 600;
        color: var(--text-primary);
      }

      .count {
        font-size: 0.8125rem;
        color: var(--text-tertiary);
      }
    }

    .loading-overlay {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      gap: 1rem;
      color: var(--text-tertiary);
      flex: 1;

      .spinner {
        width: 32px;
        height: 32px;
        border: 3px solid rgba(0, 217, 255, 0.1);
        border-top-color: var(--accent-cyan);
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .transaction-list {
      flex: 1;
      overflow-y: auto;
      padding: 0.5rem;
      -webkit-overflow-scrolling: touch;

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

    .transaction-item {
      display: flex;
      align-items: center;
      gap: 0.875rem;
      padding: 1rem;
      margin-bottom: 0.5rem;
      background: var(--bg-tertiary);
      border: 1px solid transparent;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.2s ease;
      -webkit-tap-highlight-color: transparent;

      &:hover {
        background: var(--bg-hover);
        border-color: var(--border-primary);
      }

      &:active {
        transform: scale(0.99);
      }

      &.selected {
        background: rgba(88, 166, 255, 0.15);
        border-color: var(--accent-blue);
      }

      &.kyc .tx-indicator {
        background: var(--accent-green);
      }

      &.audit .tx-indicator {
        background: var(--accent-blue);
      }
    }

    .tx-indicator {
      width: 4px;
      height: 50px;
      background: var(--text-tertiary);
      border-radius: 2px;
      flex-shrink: 0;
    }

    .tx-content {
      flex: 1;
      min-width: 0;
    }

    .tx-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 4px;
      gap: 0.5rem;
    }

    .tx-type {
      font-size: 0.625rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 2px 6px;
      border-radius: 4px;
      background: rgba(139, 148, 158, 0.15);
      color: var(--text-tertiary);
      flex-shrink: 0;

      &.kyc {
        background: rgba(56, 211, 159, 0.15);
        color: var(--accent-green);
      }

      &.audit {
        background: rgba(88, 166, 255, 0.15);
        color: var(--accent-blue);
      }
    }

    .tx-time {
      font-size: 0.6875rem;
      color: var(--text-muted);
      flex-shrink: 0;
    }

    .tx-id {
      font-family: 'SF Mono', Monaco, 'Courier New', monospace;
      font-size: 0.75rem;
      color: var(--text-secondary);
      margin-bottom: 4px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .tx-preview {
      font-size: 0.75rem;
      color: var(--text-tertiary);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      margin-bottom: 6px;
    }

    .tx-meta {
      display: flex;
      gap: 0.75rem;
      font-size: 0.6875rem;
      color: var(--text-muted);
      flex-wrap: wrap;

      span {
        display: flex;
        align-items: center;
        gap: 3px;

        svg {
          width: 11px;
          height: 11px;
        }
      }
    }

    .tx-arrow {
      flex-shrink: 0;
      color: var(--border-hover);
      transition: transform 0.2s ease;

      svg {
        width: 18px;
        height: 18px;
      }
    }

    .transaction-item:hover .tx-arrow {
      transform: translateX(4px);
      color: var(--text-tertiary);
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem 1.5rem;
      text-align: center;
      color: var(--text-muted);

      svg {
        width: 48px;
        height: 48px;
        margin-bottom: 1rem;
        opacity: 0.5;
      }

      p {
        margin: 0 0 0.5rem;
        font-size: 1rem;
        color: var(--text-tertiary);
      }

      span {
        font-size: 0.875rem;
      }
    }

    /* Mobile */
    @media (max-width: 768px) {
      .transaction-list-container {
        border-radius: 10px;
      }

      .list-header {
        padding: 0.875rem 1rem;

        h2 {
          font-size: 0.9375rem;
        }

        .count {
          font-size: 0.75rem;
        }
      }

      .transaction-list {
        padding: 0.375rem;
      }

      .transaction-item {
        padding: 0.875rem;
        margin-bottom: 0.375rem;
        gap: 0.75rem;
      }

      .tx-indicator {
        height: 45px;
      }

      .tx-id {
        font-size: 0.6875rem;
      }

      .tx-preview {
        font-size: 0.6875rem;
      }

      .tx-meta {
        font-size: 0.625rem;
        gap: 0.5rem;
      }

      .tx-arrow svg {
        width: 16px;
        height: 16px;
      }

      .empty-state {
        padding: 2rem 1rem;

        svg {
          width: 40px;
          height: 40px;
        }

        p {
          font-size: 0.9375rem;
        }

        span {
          font-size: 0.8125rem;
        }
      }
    }
  `]
})
export class TransactionListComponent {
  @Input() transactions: Transaction[] = [];
  @Input() loading = false;

  @Input() selectedId: string | undefined;
  @Input() totalCount: number = 0;
  @Input() isFiltered: boolean = false;
  @Output() selectTransaction = new EventEmitter<Transaction>();

  trackByFn(index: number, tx: Transaction): string {
    return tx.transactionId;
  }

  onSelect(tx: Transaction): void {
    this.selectTransaction.emit(tx);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    // Less than 1 hour ago
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `${minutes}m ago`;
    }

    // Less than 24 hours ago
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours}h ago`;
    }

    // Less than 7 days ago
    if (diff < 604800000) {
      const days = Math.floor(diff / 86400000);
      return `${days}d ago`;
    }

    // Older - show date
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  }

  getPreviewText(tx: Transaction): string {
    if (tx.data) {
      const type = tx.certificateType?.name?.toUpperCase();

      if (type === 'KYC') {
        const personal = tx.data.personal_information;
        if (personal) {
          return `${personal.first_name} ${personal.last_name} - ${personal.nationality || 'N/A'}`;
        }
      }

      if (type === 'AUDIT') {
        return tx.data.additional_context || tx.data.action_name || 'Audit event';
      }

      return JSON.stringify(tx.data).slice(0, 100);
    }

    if (tx.dataPreview) {
      try {
        const preview = JSON.parse(tx.dataPreview);
        if (preview.additional_context) return preview.additional_context;
        if (preview.action_name) return preview.action_name;
      } catch {
        return tx.dataPreview.slice(0, 100);
      }
    }

    return 'No preview available';
  }
}
