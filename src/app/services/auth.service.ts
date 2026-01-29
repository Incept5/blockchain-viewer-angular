import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map, tap, catchError, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthResponse } from '../models/transaction.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private tokenSubject = new BehaviorSubject<string | null>(null);
  private tokenExpiresAt: Date | null = null;

  token$ = this.tokenSubject.asObservable();

  getToken(): Observable<string> {
    const currentToken = this.tokenSubject.value;

    // Check if token exists and is not expired
    if (currentToken && this.tokenExpiresAt && new Date() < this.tokenExpiresAt) {
      return of(currentToken);
    }

    // Fetch new token
    return this.authenticate();
  }

  private authenticate(): Observable<string> {
    console.log('Authenticating with API...');
    console.log('API URL:', environment.apiUrl);

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${environment.apiKey}`
    });

    return this.http.post<AuthResponse>(
      `${environment.apiUrl}/auth/session`,
      { authorizationLevel: 1 },
      { headers }
    ).pipe(
      tap(response => {
        console.log('Auth response received:', response);
        this.tokenSubject.next(response.accessToken);
        this.tokenExpiresAt = new Date(response.expiresAt);
      }),
      map(response => response.accessToken),
      catchError(error => {
        console.error('Authentication failed:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        return throwError(() => new Error('Failed to authenticate with API'));
      })
    );
  }

  clearToken(): void {
    this.tokenSubject.next(null);
    this.tokenExpiresAt = null;
  }
}
