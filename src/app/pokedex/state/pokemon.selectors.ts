import { Injectable, inject } from '@angular/core';
import { Observable, combineLatest, map, distinctUntilChanged, shareReplay } from 'rxjs';
import { PokemonStore } from './pokemon.store';
import { Pokemon } from '../models/pokemon.model';

/**
 * Derived, memoized views over PokemonStore state.
 * Consumers subscribe to these instead of reading state$ directly.
 */
@Injectable({ providedIn: 'root' })
export class PokemonSelectors {
  private readonly store = inject(PokemonStore);

  readonly items$: Observable<Pokemon[]> = this.store.select$.pipe(
    map((s) => s.items),
    distinctUntilChanged(),
    shareReplay(1),
  );

  readonly isLoading$: Observable<boolean> = this.store.select$.pipe(
    map((s) => s.isLoading),
    distinctUntilChanged(),
  );

  readonly error$: Observable<string | null> = this.store.select$.pipe(
    map((s) => s.error),
    distinctUntilChanged(),
  );

  /** Combines items with an external search/filter signal into a filtered list. */
  filteredBy(searchTerm$: Observable<string>): Observable<Pokemon[]> {
    return combineLatest([this.items$, searchTerm$]).pipe(
      map(([items, term]) =>
        items.filter((p) => p.name.toLowerCase().includes(term.toLowerCase())),
      ),
      shareReplay(1),
    );
  }
}