import { Component, inject, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BlockchainService } from '../../services/blockchain.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <header class="header">
      <div class="header-content">
        <div class="logo-section">
          <div class="logo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div class="title-section">
            <h1>Linguard Blockchain Viewer</h1>
            <span class="subtitle">Passporting API Explorer</span>
          </div>
        </div>

        <div class="actions-section">
          <div class="search-box">
            <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Search by name..."
              [ngModel]="searchTerm"
              (ngModelChange)="onSearchChange($event)"
            />
            <button *ngIf="searchTerm" class="clear-btn" (click)="onClearSearch()" title="Clear search">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M15 9l-6 6"/>
                <path d="M9 9l6 6"/>
              </svg>
            </button>
          </div>

          <button class="sort-btn" (click)="onSortToggle()" [title]="sortOrder === 'newest' ? 'Showing newest first' : 'Showing oldest first'">
            <svg *ngIf="sortOrder === 'newest'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 5v14"/>
              <path d="M19 12l-7 7-7-7"/>
            </svg>
            <svg *ngIf="sortOrder === 'oldest'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 19V5"/>
              <path d="M5 12l7-7 7 7"/>
            </svg>
            <span>{{ sortOrder === 'newest' ? 'Newest' : 'Oldest' }}</span>
          </button>

          <button class="refresh-btn" (click)="onRefresh()" [disabled]="loading">
            <svg [class.spinning]="loading" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M23 4v6h-6"/>
              <path d="M1 20v-6h6"/>
              <path d="M3.51 9a9 9 0 0114.85-3.36L23 10"/>
              <path d="M20.49 15a9 9 0 01-14.85 3.36L1 14"/>
            </svg>
            <span>Refresh</span>
          </button>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .header {
      background: linear-gradient(135deg, #1a1f36 0%, #0d1117 100%);
      padding: 1rem 2rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .header-content {
      max-width: 1600px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 2rem;
    }

    .logo-section {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .logo {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, #00d9ff 0%, #00a3a1 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 10px;

      svg {
        width: 100%;
        height: 100%;
        color: white;
      }
    }

    .title-section {
      h1 {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 600;
        color: #fff;
        letter-spacing: -0.5px;
      }

      .subtitle {
        font-size: 0.875rem;
        color: #8b949e;
      }
    }

    .actions-section {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .search-box {
      position: relative;
      display: flex;
      align-items: center;

      .search-icon {
        position: absolute;
        left: 12px;
        width: 18px;
        height: 18px;
        color: #8b949e;
        pointer-events: none;
      }

      input {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        padding: 10px 36px 10px 40px;
        font-size: 0.875rem;
        color: #fff;
        width: 280px;
        transition: all 0.2s ease;

        &::placeholder {
          color: #6e7681;
        }

        &:focus {
          outline: none;
          border-color: #00d9ff;
          background: rgba(255, 255, 255, 0.08);
          box-shadow: 0 0 0 3px rgba(0, 217, 255, 0.1);
        }
      }

      .clear-btn {
        position: absolute;
        right: 8px;
        width: 24px;
        height: 24px;
        padding: 0;
        background: transparent;
        border: none;
        border-radius: 50%;
        color: #6e7681;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;

        svg {
          width: 16px;
          height: 16px;
        }

        &:hover {
          color: #f85149;
          background: rgba(248, 81, 73, 0.1);
        }
      }
    }

    .sort-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 10px 14px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      color: #c9d1d9;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;

      svg {
        width: 16px;
        height: 16px;
      }

      &:hover {
        background: rgba(255, 255, 255, 0.1);
        border-color: rgba(255, 255, 255, 0.2);
      }
    }

    .refresh-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      background: linear-gradient(135deg, #00d9ff 0%, #00a3a1 100%);
      border: none;
      border-radius: 8px;
      color: white;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;

      svg {
        width: 18px;
        height: 18px;

        &.spinning {
          animation: spin 1s linear infinite;
        }
      }

      &:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 217, 255, 0.3);
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    @media (max-width: 768px) {
      .header {
        padding: 1rem;
      }

      .header-content {
        flex-direction: column;
        gap: 1rem;
      }

      .search-box input {
        width: 200px;
      }
    }
  `]
})
export class HeaderComponent {
  @Input() searchTerm: string = '';
  @Input() loading: boolean = false;
  @Input() sortOrder: 'newest' | 'oldest' = 'newest';
  @Output() searchChange = new EventEmitter<string>();
  @Output() sortChange = new EventEmitter<'newest' | 'oldest'>();
  @Output() refresh = new EventEmitter<void>();

  onSearchChange(term: string): void {
    this.searchChange.emit(term);
  }

  onClearSearch(): void {
    this.searchChange.emit('');
  }

  onSortToggle(): void {
    const newOrder = this.sortOrder === 'newest' ? 'oldest' : 'newest';
    this.sortChange.emit(newOrder);
  }

  onRefresh(): void {
    this.refresh.emit();
  }
}
