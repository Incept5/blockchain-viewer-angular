import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil, combineLatest, BehaviorSubject } from 'rxjs';
import { BlockchainService } from '../../services/blockchain.service';
import { Transaction, TransactionStats } from '../../models/transaction.model';
import { HeaderComponent } from '../header/header.component';
import { TransactionListComponent } from '../transaction-list/transaction-list.component';
import { TransactionDetailComponent } from '../transaction-detail/transaction-detail.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    TransactionListComponent,
    TransactionDetailComponent
  ],
  template: `
    <div class="dashboard">
      <app-header
        [searchTerm]="searchTerm"
        [loading]="loading"
        [sortOrder]="sortOrder"
        (searchChange)="onSearchChange($event)"
        (sortChange)="onSortChange($event)"
        (refresh)="onRefresh()"
      ></app-header>

      <main class="main-content">
        <!-- Stats Cards -->
        <div class="stats-section">
          <div class="stat-card total">
            <div class="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <path d="M3 9h18"/>
                <path d="M9 21V9"/>
              </svg>
            </div>
            <div class="stat-content">
              <span class="stat-value">{{ stats.total }}</span>
              <span class="stat-label">Total Transactions</span>
            </div>
          </div>

          <div class="stat-card kyc" (click)="filterByType('KYC')">
            <div class="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div class="stat-content">
              <span class="stat-value">{{ stats.kyc }}</span>
              <span class="stat-label">KYC Records</span>
            </div>
          </div>

          <div class="stat-card audit" (click)="filterByType('AUDIT')">
            <div class="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                <path d="M14 2v6h6"/>
                <path d="M16 13H8"/>
                <path d="M16 17H8"/>
                <path d="M10 9H8"/>
              </svg>
            </div>
            <div class="stat-content">
              <span class="stat-value">{{ stats.audit }}</span>
              <span class="stat-label">Audit Logs</span>
            </div>
          </div>

          <div class="stat-card other" (click)="filterByType('ALL')">
            <div class="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v6l4 2"/>
              </svg>
            </div>
            <div class="stat-content">
              <span class="stat-value">{{ stats.other }}</span>
              <span class="stat-label">Other</span>
            </div>
          </div>
        </div>

        <!-- Filter Tabs -->
        <div class="filter-tabs">
          <button
            *ngFor="let tab of filterTabs"
            class="filter-tab"
            [class.active]="activeFilter === tab.value"
            (click)="filterByType(tab.value)"
          >
            {{ tab.label }}
            <span class="tab-count">{{ getCountForType(tab.value) }}</span>
          </button>
        </div>

        <!-- Content Area -->
        <div class="content-area">
          <div class="transactions-panel" [class.has-detail]="selectedTransaction">
            <app-transaction-list
              [transactions]="filteredTransactions"
              [loading]="loading"
              [selectedId]="selectedTransaction?.transactionId"
              [totalCount]="transactions.length"
              [isFiltered]="searchTerm.length > 0 || activeFilter !== 'ALL'"
              (selectTransaction)="onSelectTransaction($event)"
            ></app-transaction-list>
          </div>

          <div class="detail-panel" *ngIf="selectedTransaction">
            <app-transaction-detail
              [transaction]="selectedTransaction"
              (close)="onCloseDetail()"
            ></app-transaction-detail>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .dashboard {
      min-height: 100vh;
      background: #0d1117;
    }

    .main-content {
      max-width: 1600px;
      margin: 0 auto;
      padding: 2rem;
    }

    .stats-section {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 12px;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        transform: translateY(-2px);
        border-color: #484f58;
      }

      &.total {
        .stat-icon { background: rgba(139, 148, 158, 0.1); color: #8b949e; }
        &:hover { border-color: #8b949e; }
      }

      &.kyc {
        .stat-icon { background: rgba(56, 211, 159, 0.1); color: #38d19f; }
        &:hover { border-color: #38d19f; }
      }

      &.audit {
        .stat-icon { background: rgba(88, 166, 255, 0.1); color: #58a6ff; }
        &:hover { border-color: #58a6ff; }
      }

      &.other {
        .stat-icon { background: rgba(210, 153, 34, 0.1); color: #d29922; }
        &:hover { border-color: #d29922; }
      }
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;

      svg {
        width: 24px;
        height: 24px;
      }
    }

    .stat-content {
      display: flex;
      flex-direction: column;
    }

    .stat-value {
      font-size: 1.75rem;
      font-weight: 600;
      color: #fff;
    }

    .stat-label {
      font-size: 0.875rem;
      color: #8b949e;
    }

    .filter-tabs {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
      padding: 4px;
      background: #161b22;
      border-radius: 10px;
      width: fit-content;
    }

    .filter-tab {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      background: transparent;
      border: none;
      border-radius: 8px;
      color: #8b949e;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        color: #c9d1d9;
        background: rgba(255, 255, 255, 0.05);
      }

      &.active {
        background: #21262d;
        color: #fff;
      }

      .tab-count {
        background: rgba(255, 255, 255, 0.1);
        padding: 2px 8px;
        border-radius: 10px;
        font-size: 0.75rem;
      }
    }

    .content-area {
      display: flex;
      gap: 1.5rem;
      height: calc(100vh - 320px);
      min-height: 500px;
    }

    .transactions-panel {
      flex: 1;
      min-width: 0;
      transition: all 0.3s ease;

      &.has-detail {
        flex: 0 0 45%;
      }
    }

    .detail-panel {
      flex: 0 0 55%;
      min-width: 0;
      animation: slideIn 0.3s ease;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(20px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    @media (max-width: 1200px) {
      .stats-section {
        grid-template-columns: repeat(2, 1fr);
      }

      .content-area {
        flex-direction: column;
        height: auto;
      }

      .transactions-panel,
      .transactions-panel.has-detail,
      .detail-panel {
        flex: none;
        width: 100%;
      }

      .transactions-panel {
        height: 400px;
      }

      .detail-panel {
        height: auto;
        min-height: 400px;
      }
    }

    @media (max-width: 768px) {
      .main-content {
        padding: 1rem;
      }

      .stats-section {
        grid-template-columns: 1fr;
      }

      .filter-tabs {
        overflow-x: auto;
        width: 100%;
      }
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  private blockchainService = inject(BlockchainService);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();

  transactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];
  selectedTransaction: Transaction | null = null;
  loading = false;
  searchTerm = '';
  activeFilter = 'ALL';
  sortOrder: 'newest' | 'oldest' = 'newest';

  stats: TransactionStats = {
    total: 0,
    kyc: 0,
    audit: 0,
    other: 0
  };

  filterTabs = [
    { label: 'All', value: 'ALL' },
    { label: 'KYC', value: 'KYC' },
    { label: 'Audit', value: 'AUDIT' }
  ];

  ngOnInit(): void {
    // Subscribe to loading state
    this.blockchainService.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => {
        this.loading = loading;
        this.cdr.detectChanges();
      });

    // Subscribe to transactions
    this.blockchainService.getTransactions()
      .pipe(takeUntil(this.destroy$))
      .subscribe(transactions => {
        if (transactions.length > 0) {
          this.transactions = [...transactions];
          this.calculateStats();
          this.applyFilters();
          this.cdr.detectChanges();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadTransactions(): void {
    // Data is now loaded automatically by the service
  }

  calculateStats(): void {
    this.stats = {
      total: this.transactions.length,
      kyc: 0,
      audit: 0,
      other: 0
    };

    this.transactions.forEach(tx => {
      const type = tx.certificateType?.name?.toUpperCase();
      if (type === 'KYC') {
        this.stats.kyc++;
      } else if (type === 'AUDIT') {
        this.stats.audit++;
      } else {
        this.stats.other++;
      }
    });
  }

  applyFilters(): void {
    let filtered = this.blockchainService.filterTransactions(
      this.transactions,
      this.activeFilter,
      this.searchTerm
    );
    this.filteredTransactions = this.blockchainService.sortTransactions(filtered, this.sortOrder);
  }

  onSearchChange(term: string): void {
    this.searchTerm = term;
    this.applyFilters();
    this.cdr.detectChanges();
  }

  onSortChange(order: 'newest' | 'oldest'): void {
    this.sortOrder = order;
    this.applyFilters();
    this.cdr.detectChanges();
  }

  filterByType(type: string): void {
    this.activeFilter = type;
    this.applyFilters();
    this.cdr.detectChanges();
  }

  getCountForType(type: string): number {
    if (type === 'ALL') return this.stats.total;
    if (type === 'KYC') return this.stats.kyc;
    if (type === 'AUDIT') return this.stats.audit;
    return this.stats.other;
  }

  onSelectTransaction(transaction: Transaction): void {
    this.selectedTransaction = transaction;
  }

  onCloseDetail(): void {
    this.selectedTransaction = null;
  }

  onRefresh(): void {
    this.selectedTransaction = null;
    this.blockchainService.refreshTransactions();
  }
}
