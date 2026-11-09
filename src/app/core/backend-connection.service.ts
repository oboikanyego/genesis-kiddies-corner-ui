import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, retry, shareReplay, tap, throwError, timeout, timer } from 'rxjs';
import { environment } from '../../environments/environment';

export type BackendStatus = 'idle' | 'connecting' | 'ready' | 'offline';

/** Render exposes /health outside the /api router. Keep the URL in the active deployment's account. */
export function backendHealthUrl(apiUrl: string): string {
  const api = apiUrl.replace(/\/+$/, '');
  return (api.endsWith('/api') ? api.slice(0, -4) : api) + '/health';
}

/**
 * One shared startup health request, not one wake-up request per page.
 * Render Free can sleep: wait for it before allowing API calls, but leave the
 * static pages navigable and only show the status card when startup is slow.
 */
@Injectable({ providedIn: 'root' })
export class BackendConnectionService {
  private readonly http = inject(HttpClient);
  readonly status = signal<BackendStatus>('idle');
  readonly indicatorVisible = signal(false);
  private readonly statusSubject = new BehaviorSubject<BackendStatus>('idle');
  readonly status$ = this.statusSubject.asObservable();
  private activeRequest?: Observable<void>;

  private changeStatus(status: BackendStatus): void {
    this.status.set(status);
    this.statusSubject.next(status);
  }

  /** All callers share the same connection attempt. Each HTTP request still runs independently after readiness. */
  ready(): Observable<void> {
    if (this.status() === 'offline') {
      return throwError(() => new Error('The booking service is currently unavailable. Please try connecting again.'));
    }
    if (this.activeRequest) return this.activeRequest;

    this.changeStatus('connecting');
    this.indicatorVisible.set(false);
    const noticeTimer = setTimeout(() => {
      if (this.status() === 'connecting') this.indicatorVisible.set(true);
    }, 900);

    // A sleeping Render instance may need more than a single request timeout.
    // Bounded attempts ensure the interface never displays an endless spinner.
    this.activeRequest = this.http.get<{status: string}>(backendHealthUrl(environment.apiUrl)).pipe(
      timeout({ first: 30000 }),
      map(result => {
        if (result.status !== 'ok') throw new Error('The booking service did not pass its health check.');
      }),
      retry({ count: 2, delay: (_error, attempt) => timer(attempt * 2500) }),
      tap({
        next: () => {
          clearTimeout(noticeTimer);
          this.changeStatus('ready');
          this.indicatorVisible.set(false);
        },
        error: () => {
          clearTimeout(noticeTimer);
          this.changeStatus('offline');
          this.indicatorVisible.set(true);
        }
      }),
      shareReplay({ bufferSize: 1, refCount: false })
    );

    return this.activeRequest;
  }

  /** Runs on app startup, even if the visitor stays on a static About page. */
  start(): void {
    this.ready().subscribe({ error: () => { /* status card exposes a Retry button */ } });
  }

  retryConnection(): void {
    if (this.status() !== 'offline') return;
    this.activeRequest = undefined;
    this.start();
  }
}
