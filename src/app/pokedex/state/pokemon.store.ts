import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Pokemon } from '../models/pokemon.model';

interface PokemonState {
  items: Pokemon[];
  isLoading: boolean;
  error: string | null;
}

const initialState: PokemonState = {
  items: [],
  isLoading: false,
  error: null,
};

/**
 * Holds the cached Pokémon list and loading/error state.
 * Single source of truth for pokedex data — components never
 * mutate this directly, only via the store's public methods.
 */
@Injectable({ providedIn: 'root' })
export class PokemonStore {
  private readonly state$ = new BehaviorSubject<PokemonState>(initialState);

  /** Full state stream, exposed read-only. */
  readonly select$: Observable<PokemonState> = this.state$.asObservable();

  /** Replaces the cached Pokémon list (e.g. after a successful fetch). */
  setItems(items: Pokemon[]): void {
    this.patch({ items, isLoading: false, error: null });
  }

  setLoading(isLoading: boolean): void {
    this.patch({ isLoading, error: isLoading ? null : this.state$.value.error });
  }

  setError(error: string): void {
    this.patch({ error, isLoading: false });
  }

  private patch(partial: Partial<PokemonState>): void {
    this.state$.next({ ...this.state$.value, ...partial });
  }
}