import { Injectable, inject, NgZone } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, of, firstValueFrom } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {
  Transaction,
  TransactionsResponse,
  TransactionStats,
  AuthResponse
} from '../models/transaction.model';

@Injectable({
  providedIn: 'root'
})
export class BlockchainService {
  private http = inject(HttpClient);
  private ngZone = inject(NgZone);

  private transactionsCache$ = new BehaviorSubject<Transaction[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(true);
  private accessToken: string | null = null;
  private initialized = false;

  loading$ = this.loadingSubject.asObservable();
  transactions$ = this.transactionsCache$.asObservable();

  constructor() {
    this.initializeData();
  }

  private async initializeData(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;

    try {
      // Step 1: Get auth token
      const authHeaders = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${environment.apiKey}`
      });

      const authResponse = await firstValueFrom(
        this.http.post<AuthResponse>(
          `${environment.apiUrl}/auth/session`,
          { authorizationLevel: 1 },
          { headers: authHeaders }
        )
      );

      this.accessToken = authResponse.accessToken;

      // Step 2: Fetch transactions with expanded data
      const txHeaders = new HttpHeaders({
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      });

      const txResponse = await firstValueFrom(
        this.http.get<TransactionsResponse>(
          `${environment.apiUrl}/blockchain/transactions?expandData=true&pageSize=1000`,
          { headers: txHeaders }
        )
      );

      const transactions = txResponse.items || [];

      // Update in Angular zone to ensure change detection
      this.ngZone.run(() => {
        this.transactionsCache$.next(transactions);
        this.loadingSubject.next(false);
      });

    } catch (error: any) {
      console.error('Failed to load blockchain data:', error.message);

      this.ngZone.run(() => {
        this.loadingSubject.next(false);
      });
    }
  }

  getTransactions(): Observable<Transaction[]> {
    return this.transactions$;
  }

  async refreshTransactions(): Promise<void> {
    this.initialized = false;
    this.loadingSubject.next(true);
    await this.initializeData();
  }

  getTransaction(transactionId: string): Observable<Transaction | null> {
    if (!this.accessToken) {
      console.error('No access token available');
      return of(null);
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json'
    });

    return this.http.get<Transaction>(
      `${environment.apiUrl}/blockchain/transactions/${transactionId}`,
      { headers }
    ).pipe(
      catchError(error => {
        console.error('Failed to fetch transaction:', error);
        return of(null);
      })
    );
  }

  filterTransactions(
    transactions: Transaction[],
    type?: string,
    searchTerm?: string
  ): Transaction[] {
    let filtered = [...transactions];

    if (type && type !== 'ALL') {
      filtered = filtered.filter(tx =>
        tx.certificateType?.name?.toUpperCase() === type.toUpperCase()
      );
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(tx => {
        // Search in KYC personal information (full name)
        if (tx.data?.personal_information) {
          const personal = tx.data.personal_information;
          const fullName = [
            personal.first_name,
            personal.middle_name,
            personal.last_name
          ].filter(Boolean).join(' ').toLowerCase();

          if (fullName.includes(term)) {
            return true;
          }
        }

        // Search in audit actor name
        if (tx.data?.actor_name?.toLowerCase().includes(term)) {
          return true;
        }

        // Search in transaction ID
        if (tx.transactionId.toLowerCase().includes(term)) {
          return true;
        }

        // Search in additional context (for audit)
        if (tx.data?.additional_context?.toLowerCase().includes(term)) {
          return true;
        }

        // Search in data preview as fallback
        if (tx.dataPreview?.toLowerCase().includes(term)) {
          return true;
        }

        return false;
      });
    }

    return filtered;
  }

  sortTransactions(
    transactions: Transaction[],
    sortOrder: 'newest' | 'oldest'
  ): Transaction[] {
    return [...transactions].sort((a, b) => {
      const dateA = new Date(a.insertedAt).getTime();
      const dateB = new Date(b.insertedAt).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
  }
}
