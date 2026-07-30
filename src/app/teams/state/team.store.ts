import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, catchError, finalize, of, tap } from 'rxjs';
import { TeamApiService } from '../services/team-api.service';
import { Team, CreateTeamPayload } from '../models/team.model';

interface TeamState {
  items: Team[];
  isLoading: boolean;
  error: string | null;
}

const initialState: TeamState = {
  items: [],
  isLoading: false,
  error: null,
};

/** Generates a temporary client-side id for optimistic inserts. */
function tempId(): string {
  return `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/**
 * Holds team state with optimistic create: a new team appears
 * in the list immediately, then is reconciled with the server
 * response, or rolled back with an error if the mutation fails.
 */
@Injectable({ providedIn: 'root' })
export class TeamStore {
  private readonly api = inject(TeamApiService);
  private readonly state$ = new BehaviorSubject<TeamState>(initialState);

  readonly select$: Observable<TeamState> = this.state$.asObservable();

  /** Loads all teams from the server, replacing the cached list. */
  loadTeams(): void {
    this.patch({ isLoading: true, error: null });
    this.api
      .getTeams$()
      .pipe(
        tap((items) => this.patch({ items, isLoading: false })),
        catchError((err: Error) => {
          this.patch({ isLoading: false, error: err.message });
          return of(null);
        }),
      )
      .subscribe();
  }

  /**
   * Optimistically inserts the new team, then confirms or rolls
   * back based on the mutation result.
   */
  createTeam(payload: CreateTeamPayload): void {
    const optimisticTeam: Team = {
      id: tempId(),
      trainerId: payload.trainerId,
      name: payload.name,
      pokemonIds: payload.pokemonIds,
      createdAt: new Date().toISOString(),
    };

    // Insert immediately, before the network call resolves
    this.patch({
      items: [...this.state$.value.items, optimisticTeam],
      error: null,
    });

    this.api
      .createTeam$(payload)
      .pipe(
        tap((serverTeam) => this.replaceOptimistic(optimisticTeam.id, serverTeam)),
        catchError((err: Error) => {
          this.rollback(optimisticTeam.id, err.message);
          return of(null);
        }),
      )
      .subscribe();
  }

  /** Replaces the temp optimistic record with the confirmed server record. */
  private replaceOptimistic(tempId: string, serverTeam: Team): void {
    this.patch({
      items: this.state$.value.items.map((t) => (t.id === tempId ? serverTeam : t)),
    });
  }

  /** Removes the optimistic record and surfaces an error on failure. */
  private rollback(tempId: string, errorMessage: string): void {
    this.patch({
      items: this.state$.value.items.filter((t) => t.id !== tempId),
      error: `Failed to create team: ${errorMessage}`,
    });
  }

  private patch(partial: Partial<TeamState>): void {
    this.state$.next({ ...this.state$.value, ...partial });
  }
}