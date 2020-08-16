import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, throwError, combineLatest, BehaviorSubject } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';

import { Product } from './product';
import { Supplier } from '../suppliers/supplier';
import { SupplierService } from '../suppliers/supplier.service';
import { ProductCategoryService } from '../product-categories/product-category.service';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private productsUrl = 'api/products';
  private suppliersUrl = this.supplierService.suppliersUrl;

  constructor(
    private http: HttpClient,
    private supplierService: SupplierService,
    private productCategoryService: ProductCategoryService
  ) {}

  // reactive coding (Declarative and Reactive pattern for Data Retrieval)
  products$ = this.http.get<Product[]>(this.productsUrl).pipe(
    tap((data) => console.log('Products: ', JSON.stringify(data))),
    catchError(this.handleError)
  );

  ProductWithCategory$ = combineLatest([
    this.products$,
    this.productCategoryService.productsCategories$,
  ]).pipe(
    map(([products, categories]) =>
      products.map(
        (product) =>
          ({
            ...product,
            price: product.price * 1.5,
            // Find the category id and it name then assign it to category
            category: categories.find((c) => product.categoryId === c.id).name,
            searchKey: [product.productName],
          } as Product)
      )
    )
  );

  /*
  START
  This was done in the service since it is two component that will use it
    -- product-list-alt
    -- product-detail
   This is different from the one on the main product-list page
 */
  private productSelectedSubject = new BehaviorSubject<number>(0);
  productSelectedAction$ = this.productSelectedSubject.asObservable();

  selectedProduct$ = combineLatest([
    this.ProductWithCategory$,
    this.productSelectedAction$,
  ]).pipe(
    map(([products, selectedProductId]) =>
      products.find((product) => product.id === selectedProductId)
    ),
    tap((product) => console.log('selectedProduct', product))
  );

  selectedProductChanged(selectedProductId: number): void {
    this.productSelectedSubject.next(selectedProductId);
  }
  /*
  END
  This was done in the service since it is two component that will use it
    -- product-list-alt
    -- product-detail
   This is different from the one on the main product-list page
 */

  private fakeProduct(): Product {
    return {
      id: 42,
      productName: 'Another One',
      productCode: 'TBX-0042',
      description: 'Our new product',
      price: 8.9,
      categoryId: 3,
      // category: 'Toolbox',
      quantityInStock: 30,
    };
  }

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
