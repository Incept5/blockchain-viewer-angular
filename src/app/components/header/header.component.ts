import { Component, inject, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '../../services/theme.service';

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
            <h1>Linguard <span class="hide-mobile">Blockchain Viewer</span></h1>
            <span class="subtitle hide-mobile">Passporting API Explorer</span>
          </div>
        </div>

        <div class="actions-section">
          <div class="search-box" [class.expanded]="searchExpanded">
            <button class="search-toggle" (click)="toggleSearch()" *ngIf="!searchExpanded">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21l-4.35-4.35"/>
              </svg>
            </button>
            <div class="search-input-wrapper" *ngIf="searchExpanded || !isMobile">
              <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21l-4.35-4.35"/>
              </svg>
              <input
                #searchInput
                type="text"
                placeholder="Search by name..."
                [ngModel]="searchTerm"
                (ngModelChange)="onSearchChange($event)"
                (blur)="onSearchBlur()"
              />
              <button *ngIf="searchTerm" class="clear-btn" (click)="onClearSearch()" title="Clear search">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M15 9l-6 6"/>
                  <path d="M9 9l6 6"/>
                </svg>
              </button>
              <button *ngIf="isMobile && !searchTerm" class="clear-btn" (click)="closeSearch()" title="Close search">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 6L6 18"/>
                  <path d="M6 6l12 12"/>
                </svg>
              </button>
            </div>
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
            <span class="hide-mobile">{{ sortOrder === 'newest' ? 'Newest' : 'Oldest' }}</span>
          </button>

          <button class="refresh-btn" (click)="onRefresh()" [disabled]="loading">
            <svg [class.spinning]="loading" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M23 4v6h-6"/>
              <path d="M1 20v-6h6"/>
              <path d="M3.51 9a9 9 0 0114.85-3.36L23 10"/>
              <path d="M20.49 15a9 9 0 01-14.85 3.36L1 14"/>
            </svg>
            <span class="hide-mobile">Refresh</span>
          </button>

          <button class="theme-toggle" (click)="onThemeToggle()" [title]="themeService.theme() === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'">
            <!-- Sun icon (shown in dark mode) -->
            <svg *ngIf="themeService.theme() === 'dark'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="5"/>
              <path d="M12 1v2"/>
              <path d="M12 21v2"/>
              <path d="M4.22 4.22l1.42 1.42"/>
              <path d="M18.36 18.36l1.42 1.42"/>
              <path d="M1 12h2"/>
              <path d="M21 12h2"/>
              <path d="M4.22 19.78l1.42-1.42"/>
              <path d="M18.36 5.64l1.42-1.42"/>
            </svg>
            <!-- Moon icon (shown in light mode) -->
            <svg *ngIf="themeService.theme() === 'light'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
            </svg>
          </button>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .header {
      background: linear-gradient(135deg, var(--header-gradient-start) 0%, var(--header-gradient-end) 100%);
      padding: 1rem 2rem;
      border-bottom: 1px solid var(--border-primary);
      position: sticky;
      top: 0;
      z-index: 100;
      transition: background 0.3s ease, border-color 0.3s ease;
    }

    .header-content {
      max-width: 1600px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
    }

    .logo-section {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-shrink: 0;
    }

    .logo {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, var(--accent-cyan) 0%, var(--accent-cyan-dark) 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 10px;
      flex-shrink: 0;

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
        color: var(--text-primary);
        letter-spacing: -0.5px;
        white-space: nowrap;
      }

      .subtitle {
        font-size: 0.875rem;
        color: var(--text-tertiary);
      }
    }

    .actions-section {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: nowrap;
    }

    .search-box {
      position: relative;
      display: flex;
      align-items: center;

      .search-toggle {
        display: none;
        width: 40px;
        height: 40px;
        align-items: center;
        justify-content: center;
        background: var(--input-bg);
        border: 1px solid var(--input-border);
        border-radius: 8px;
        color: var(--text-secondary);
        cursor: pointer;
        transition: all 0.2s ease;

        svg {
          width: 20px;
          height: 20px;
        }

        &:hover {
          background: var(--input-bg-focus);
          border-color: var(--input-border-hover);
        }
      }

      .search-input-wrapper {
        position: relative;
        display: flex;
        align-items: center;
      }

      .search-icon {
        position: absolute;
        left: 12px;
        width: 18px;
        height: 18px;
        color: var(--text-tertiary);
        pointer-events: none;
      }

      input {
        background: var(--input-bg);
        border: 1px solid var(--input-border);
        border-radius: 8px;
        padding: 10px 36px 10px 40px;
        font-size: 0.875rem;
        color: var(--text-primary);
        width: 280px;
        transition: all 0.2s ease;

        &::placeholder {
          color: var(--text-muted);
        }

        &:focus {
          outline: none;
          border-color: var(--accent-cyan);
          background: var(--input-bg-focus);
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
        color: var(--text-muted);
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
          color: var(--accent-red);
          background: rgba(248, 81, 73, 0.1);
        }
      }
    }

    .sort-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 10px 14px;
      background: var(--input-bg);
      border: 1px solid var(--input-border);
      border-radius: 8px;
      color: var(--text-secondary);
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;

      svg {
        width: 16px;
        height: 16px;
      }

      &:hover {
        background: var(--input-bg-focus);
        border-color: var(--input-border-hover);
      }
    }

    .refresh-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      background: linear-gradient(135deg, var(--accent-cyan) 0%, var(--accent-cyan-dark) 100%);
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

    .theme-toggle {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--input-bg);
      border: 1px solid var(--input-border);
      border-radius: 8px;
      color: var(--text-secondary);
      cursor: pointer;
      transition: all 0.2s ease;
      flex-shrink: 0;

      svg {
        width: 20px;
        height: 20px;
      }

      &:hover {
        background: var(--input-bg-focus);
        border-color: var(--input-border-hover);
        color: var(--accent-yellow);
      }
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    /* Tablet */
    @media (max-width: 1024px) {
      .header {
        padding: 0.875rem 1.5rem;
      }

      .search-box input {
        width: 200px;
      }
    }

    /* Mobile */
    @media (max-width: 768px) {
      .header {
        padding: 0.75rem 1rem;
      }

      .logo {
        width: 40px;
        height: 40px;
        padding: 8px;
        border-radius: 10px;
      }

      .title-section h1 {
        font-size: 1.125rem;
      }

      .hide-mobile {
        display: none !important;
      }

      .actions-section {
        gap: 0.5rem;
      }

      .search-box {
        .search-toggle {
          display: flex;
        }

        .search-input-wrapper {
          display: none;
        }

        &.expanded {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          padding: 0.75rem 1rem;
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border-primary);
          z-index: 200;

          .search-toggle {
            display: none;
          }

          .search-input-wrapper {
            display: flex;
            width: 100%;
          }

          input {
            width: 100%;
          }
        }
      }

      .sort-btn {
        width: 40px;
        height: 40px;
        padding: 0;
        justify-content: center;

        svg {
          width: 18px;
          height: 18px;
        }
      }

      .refresh-btn {
        width: 40px;
        height: 40px;
        padding: 0;
        justify-content: center;

        svg {
          width: 20px;
          height: 20px;
        }
      }

      .theme-toggle {
        width: 36px;
        height: 36px;

        svg {
          width: 18px;
          height: 18px;
        }
      }
    }

    /* Small mobile */
    @media (max-width: 380px) {
      .logo-section {
        gap: 0.5rem;
      }

      .logo {
        width: 36px;
        height: 36px;
        padding: 7px;
      }

      .title-section h1 {
        font-size: 1rem;
      }

      .actions-section {
        gap: 0.375rem;
      }

      .sort-btn,
      .refresh-btn,
      .theme-toggle,
      .search-box .search-toggle {
        width: 36px;
        height: 36px;
      }
    }
  `]
})
export class HeaderComponent {
  themeService = inject(ThemeService);

  @Input() searchTerm: string = '';
  @Input() loading: boolean = false;
  @Input() sortOrder: 'newest' | 'oldest' = 'newest';
  @Output() searchChange = new EventEmitter<string>();
  @Output() sortChange = new EventEmitter<'newest' | 'oldest'>();
  @Output() refresh = new EventEmitter<void>();

  searchExpanded = false;
  isMobile = false;

  constructor() {
    this.checkMobile();
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', () => this.checkMobile());
    }
  }

  private checkMobile(): void {
    if (typeof window !== 'undefined') {
      this.isMobile = window.innerWidth <= 768;
      if (!this.isMobile) {
        this.searchExpanded = false;
      }
    }
  }

  toggleSearch(): void {
    this.searchExpanded = true;
    setTimeout(() => {
      const input = document.querySelector('.search-input-wrapper input') as HTMLInputElement;
      if (input) input.focus();
    }, 100);
  }

  closeSearch(): void {
    this.searchExpanded = false;
  }

  onSearchBlur(): void {
    if (this.isMobile && !this.searchTerm) {
      setTimeout(() => {
        this.searchExpanded = false;
      }, 200);
    }
  }

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

  onThemeToggle(): void {
    this.themeService.toggleTheme();
  }
}
