import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { GraphQLClientService } from '../../core/graphql-client.service';
import { POKEAPI_GRAPHQL_ENDPOINT } from '../../common/constants';
import { Pokemon } from '../models/pokemon.model';

const GET_POKEMON_LIST = /* GraphQL */ `
  query GetPokemon($limit: Int, $offset: Int) {
    pokemon_v2_pokemon(limit: $limit, offset: $offset) {
      id
      name
      height
      weight
      pokemon_v2_pokemontypes {
        pokemon_v2_type { name }
      }
      pokemon_v2_pokemonstats {
        base_stat
        pokemon_v2_stat { name }
      }
      pokemon_v2_pokemonsprites {
        sprites
      }
    }
  }
`;

interface PokemonListResponse {
  pokemon_v2_pokemon: RawPokemon[];
}

// Raw shape matches the GraphQL response before we normalize it
interface RawPokemon {
  id: number;
  name: string;
  height: number;
  weight: number;
  pokemon_v2_pokemontypes: { pokemon_v2_type: { name: string } }[];
  pokemon_v2_pokemonstats: { base_stat: number; pokemon_v2_stat: { name: string } }[];
  pokemon_v2_pokemonsprites: { sprites: Record<string, unknown> }[];
}

@Injectable({ providedIn: 'root' })
export class PokemonApiService {
  private readonly client = inject(GraphQLClientService);

  /** Fetches a page of Pokémon with types, stats, and sprites. */
  getPokemonList$(limit: number, offset: number): Observable<Pokemon[]> {
    return this.client
      .execute$<PokemonListResponse>(
        POKEAPI_GRAPHQL_ENDPOINT,
        GET_POKEMON_LIST,
        { limit, offset },
        true, // retry on transient failure
      )
      .pipe(map((res) => res.pokemon_v2_pokemon.map((raw) => this.normalize(raw))));
  }

  private normalize(raw: RawPokemon): Pokemon {
    return {
      id: raw.id,
      name: raw.name,
      height: raw.height,
      weight: raw.weight,
      types: raw.pokemon_v2_pokemontypes.map((t) => t.pokemon_v2_type.name),
      stats: Object.fromEntries(
        raw.pokemon_v2_pokemonstats.map((s) => [s.pokemon_v2_stat.name, s.base_stat]),
      ),
      spriteUrl: this.extractSprite(raw.pokemon_v2_pokemonsprites[0]?.sprites),
    };
  }

  private extractSprite(sprites?: Record<string, unknown>): string {
    if (!sprites) return '';
    
      return (sprites['front_default'] as string) ?? '';
      
  }
}