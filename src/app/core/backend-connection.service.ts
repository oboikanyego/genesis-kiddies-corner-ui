import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, retry, shareReplay, tap, throwError, timeout, timer } from 'rxjs';
import { environment } from '../../environments/environment';
import { backendHealthUrl, shouldRecheckBackend } from './backend-health-url';

export type BackendStatus = 'idle' | 'connecting' | 'ready' | 'offline';

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
  private lastBackendContactAt: number | null = null;
  private awaySince: number | null = null;

  private changeStatus(status: BackendStatus): void {
    this.status.set(status);
    this.statusSubject.next(status);
  }

  /** A successful API response confirms the Render service is already running. */
  noteBackendActivity(): void {
    this.lastBackendContactAt = Date.now();
  }

  /** Called on tab blur/hidden, without running background polling or keep-alive timers. */
  noteAway(): void {
    this.awaySince ??= Date.now();
  }

  /**
   * On focus/visibility return, wake the backend if away for >=15 minutes.
   * Browsers throttle background timers, so this uses wall-clock time instead.
   * Duplicate focus + visibility events share the same in-flight health request.
   */
  onReturn(): void {
    if (typeof document !== 'undefined' && document.hidden) return;
    const now = Date.now();
    const wasAwayLongEnough = this.awaySince !== null && shouldRecheckBackend(this.awaySince, now);
    this.awaySince = null;
    if (this.status() === 'connecting') return;
    if (wasAwayLongEnough) {
      // Even an earlier offline failure deserves a fresh attempt after a long absence.
      this.activeRequest = undefined;
      this.changeStatus('idle');
      this.start();
    } else if (this.status() === 'ready' && shouldRecheckBackend(this.lastBackendContactAt, now)) {
      // Also covers a restored tab where the browser omitted a blur/hidden event.
      this.start();
    }
  }

  /** All callers share the same connection attempt. Each HTTP request still runs independently after readiness. */
  ready(): Observable<void> {
    if (this.status() === 'offline') {
      return throwError(() => new Error('The booking service is currently unavailable. Please try connecting again.'));
    }
    if (this.activeRequest) {
      // A successful, cached health result is safe only while the backend was active recently.
      if (this.status() === 'connecting' || !shouldRecheckBackend(this.lastBackendContactAt, Date.now())) {
        return this.activeRequest;
      }
      this.activeRequest = undefined;
    }

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
          this.noteBackendActivity();
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
    this.changeStatus('idle');
    this.start();
  }
}
