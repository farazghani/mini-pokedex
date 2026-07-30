import { Injectable } from '@angular/core';
import { Observable, defer, from, retry, timer } from 'rxjs';
import { API_RETRY_DELAY_MS, API_MAX_RETRIES } from '../common/constants';

interface GraphQLResponse<T> {
  data?: T;
  errors?: { message: string }[];
}

/**
 * Thin wrapper around fetch for executing GraphQL operations.
 * Mirrors the Observable-returning service pattern from the dev guide
 * (defer + async) rather than a heavier client like Apollo.
 */
@Injectable({ providedIn: 'root' })
export class GraphQLClientService {
  /**
   * Executes a GraphQL query or mutation against the given endpoint.
   * Retries transient failures with a fixed delay.
   */
  execute$<T>(
    endpoint: string,
    query: string,
    variables: Record<string, unknown> = {},
    withRetry = false,
  ): Observable<T> {
    const request$ = defer(() =>
      from(this.fetchGraphQL<T>(endpoint, query, variables)),
    );

    return withRetry
      ? request$.pipe(retry({ count: API_MAX_RETRIES, delay: () => timer(API_RETRY_DELAY_MS) }))
      : request$;
  }

  private async fetchGraphQL<T>(
    endpoint: string,
    query: string,
    variables: Record<string, unknown>,
  ): Promise<T> {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables }),
    });

    if (!res.ok) {
      throw new Error(`GraphQL request failed with status ${res.status}`);
    }

    const json: GraphQLResponse<T> = await res.json();

    if (json.errors?.length) {
      throw new Error(json.errors[0].message);
    }
    if (!json.data) {
      throw new Error('GraphQL response missing data');
    }

    return json.data;
  }
}