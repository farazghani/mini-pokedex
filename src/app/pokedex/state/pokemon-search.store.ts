import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, debounceTime, distinctUntilChanged } from 'rxjs';

/**
 * Holds the raw search input and exposes a debounced,
 * deduplicated stream for selectors to consume.
 */
@Injectable({ providedIn: 'root' })
export class PokemonSearchStore {
  private readonly term$ = new BehaviorSubject<string>('');

  /** Debounced search term — waits for typing to pause before emitting. */
  readonly debouncedTerm$: Observable<string> = this.term$.pipe(
    debounceTime(300),
    distinctUntilChanged(),
  );

  setTerm(term: string): void {
    this.term$.next(term);
  }
}