import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { throwError, Observable, of } from 'rxjs';
import {
  map,
  concatMap,
  tap,
  mergeMap,
  switchMap,
  shareReplay,
  catchError,
} from 'rxjs/operators';
import { Supplier } from './supplier';

@Injectable({
  providedIn: 'root',
})
export class SupplierService {
  suppliersUrl = 'api/suppliers';

  /*
  <-- START -->
  testing different type of map on higher-order observable
  ignore them
  */
  suppliersWithMap$ = of(1, 5, 8).pipe(
    map((id) => this.http.get<Supplier>(`${this.suppliersUrl}/${id}`))
  );

  suppliersWithConcatMap$ = of(1, 5, 8).pipe(
    tap((id) => console.log('concatMap source Observable', id)),
    concatMap((id) => this.http.get<Supplier>(`${this.suppliersUrl}/${id}`))
  );

  suppliersWithMergeMap$ = of(1, 5, 8).pipe(
    tap((id) => console.log('MergeMap source Observable', id)),
    mergeMap((id) => this.http.get<Supplier>(`${this.suppliersUrl}/${id}`))
  );

  suppliersWithSwitchMap$ = of(1, 5, 8).pipe(
    tap((id) => console.log('SwitchMap source Observable', id)),
    switchMap((id) => this.http.get<Supplier>(`${this.suppliersUrl}/${id}`))
  );

  /*
  <-- END -->
  testing different type of map on higher-order observable
  ignore them
  */

  constructor(private http: HttpClient) {
    // this.suppliersWithMap$.subscribe((o) =>
    //   o.subscribe((item) => console.log('map result', item))
    // );
    // this.suppliersWithConcatMap$.subscribe((item) =>
    //   console.log('concatMap result', item)
    // );
    // this.suppliersWithMergeMap$.subscribe((item) =>
    //   console.log('MergeMap result', item)
    // );
    // this.suppliersWithSwitchMap$.subscribe((item) =>
    //   console.log('SwitchMap result', item)
    // );
  }

  suppliers$ = this.http.get<Supplier[]>(this.suppliersUrl).pipe(
    tap((data) => console.log('suppliers', JSON.stringify(data))),
    shareReplay(1),
    catchError(this.handleError)
  );

  private handleError(err: any): Observable<never> {
    // in a real world app, we may send the server to some remote logging infrastructure
    // instead of just logging it to the console
    let errorMessage: string;
    if (err.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      errorMessage = `An error occurred: ${err.error.message}`;
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      errorMessage = `Backend returned code ${err.status}: ${err.body.error}`;
    }
    console.error(err);
    return throwError(errorMessage);
  }
}
