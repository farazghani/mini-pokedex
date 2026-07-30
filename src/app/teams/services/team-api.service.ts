import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { GraphQLClientService } from '../../core/graphql-client.service';
import { TEAMS_GRAPHQL_ENDPOINT } from '../../common/constants';
import { Team, CreateTeamPayload } from '../models/team.model';

const GET_TEAMS = /* GraphQL */ `
  query GetTeams {
    teams {
      id
      trainer_id
      name
      pokemon_ids
      created_at
    }
  }
`;

const CREATE_TEAM = /* GraphQL */ `
  mutation CreateTeam($trainer_id: Int!, $name: String!, $pokemon_ids: [Int]!, $created_at: String!) {
    createTeam(trainer_id: $trainer_id, name: $name, pokemon_ids: $pokemon_ids, created_at: $created_at) {
      id
      trainer_id
      name
      pokemon_ids
      created_at
    }
  }
`;

const DELETE_TEAM = /* GraphQL */ `
  mutation DeleteTeam($id: ID!) {
    removeTeam(id: $id) {
      id
    }
  }
`;

interface RawTeam {
  id: string;
  trainer_id: number;
  name: string;
  pokemon_ids: number[];
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class TeamApiService {
  private readonly client = inject(GraphQLClientService);

  /** Fetches all teams. */
  getTeams$(): Observable<Team[]> {
    return this.client
      .execute$<{ teams: RawTeam[] }>(TEAMS_GRAPHQL_ENDPOINT, GET_TEAMS, {}, true)
      .pipe(map((res) => res.teams.map(this.normalize)));
  }

  /** Creates a new team and returns the server-assigned record. */
  createTeam$(payload: CreateTeamPayload): Observable<Team> {
    return this.client
      .execute$<{ createTeam: RawTeam }>(TEAMS_GRAPHQL_ENDPOINT, CREATE_TEAM, {
        trainer_id: payload.trainerId,
        name: payload.name,
        pokemon_ids: payload.pokemonIds,
        created_at: new Date().toISOString(),
      })
      .pipe(map((res) => this.normalize(res.createTeam)));
  }

  /** Deletes a team by id. */
  deleteTeam$(id: string): Observable<void> {
    return this.client
      .execute$<{ removeTeam: { id: string } }>(TEAMS_GRAPHQL_ENDPOINT, DELETE_TEAM, { id })
      .pipe(map(() => undefined));
  }

  private normalize(raw: RawTeam): Team {
    return {
      id: raw.id,
      trainerId: raw.trainer_id,
      name: raw.name,
      pokemonIds: raw.pokemon_ids,
      createdAt: raw.created_at,
    };
  }
}