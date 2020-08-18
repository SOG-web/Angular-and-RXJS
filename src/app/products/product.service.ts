import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import {
  Observable,
  throwError,
  combineLatest,
  BehaviorSubject,
  Subject,
  merge,
  from,
} from 'rxjs';
import {
  catchError,
  tap,
  map,
  scan,
  shareReplay,
  mergeMap,
  toArray,
  filter,
  switchMap,
} from 'rxjs/operators';

import { Product } from './product';
import { Supplier } from '../suppliers/supplier';
import { SupplierService } from '../suppliers/supplier.service';
import { ProductCategoryService } from '../product-categories/product-category.service';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  constructor(
    private http: HttpClient,
    private supplierService: SupplierService,
    private productCategoryService: ProductCategoryService
  ) {}
  private productsUrl = 'api/products';
  private suppliersUrl = this.supplierService.suppliersUrl;

  // All products
  // reactive coding (Declarative and Reactive pattern for Data Retrieval)
  products$ = this.http.get<Product[]>(this.productsUrl).pipe(
    tap((data) => console.log('Products: ', JSON.stringify(data))),
    catchError(this.handleError)
  );

  // Combine products with categories
  // Map to the revised shape.
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
    ),
    shareReplay(1)
  );

  // Action Stream
  private productInsertedSubject = new Subject<Product>();
  productInsertedAction$ = this.productInsertedSubject.asObservable();

  // Merge the streams
  productWithAdd$ = merge(
    this.ProductWithCategory$,
    this.productInsertedAction$
  ).pipe(scan((acc: Product[], value: Product) => [...acc, value]));

  /*
  START
  This was done in the service since it is two component that will use it
    -- product-list-alt
    -- product-detail
   This is different from the one on the main product-list page
 */

  // Action stream for product selection
  // Default to 0 for no product
  // Must have a default so the stream emits at least once.
  private productSelectedSubject = new BehaviorSubject<number>(0);
  productSelectedAction$ = this.productSelectedSubject.asObservable();

  // Currently selected product
  // Used in both List and Detail pages,
  // so use the shareReply to share it with any component that uses it
  selectedProduct$ = combineLatest([
    this.ProductWithCategory$,
    this.productSelectedAction$,
  ]).pipe(
    map(([products, selectedProductId]) =>
      products.find((product) => product.id === selectedProductId)
    ),
    // tap((product) => console.log('selectedProduct', product)),
    shareReplay(1)
  );

  /* Get it all method
  // Suppliers for the selected product
  // Finds suppliers from download of all suppliers
  // Add a catchError so that the display appears
  // even if the suppliers cannot be retrieved.
  // Note that it must return an empty array and not EMPTY
  // or the stream will complete.
  selectedProductSuppliers$ = combineLatest([
    this.selectedProduct$,
    this.supplierService.suppliers$,
  ]).pipe(
    map(([selectedProduct, suppliers]) =>
      suppliers.filter((supplier) =>
        selectedProduct.supplierIds.includes(supplier.id)
      )
    )
  );*/

  // Just in Time method
  // Suppliers for the selected product
  // Only gets the suppliers it needs
  selectedProductSuppliers$ = this.selectedProduct$.pipe(
    filter((selectedProduct) => Boolean(selectedProduct)),
    switchMap((selectedProduct) =>
      from(selectedProduct.supplierIds).pipe(
        mergeMap((supplierId) =>
          this.http.get<Supplier>(`${this.suppliersUrl}/${supplierId}`)
        ),
        tap((suppliers) =>
          console.log('product supplier', JSON.stringify(suppliers))
        ),
        toArray()
      )
    )
  );

  // Change the selected product
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

  addProduct(newProduct?: Product): void {
    newProduct = newProduct || this.fakeProduct();
    this.productInsertedSubject.next(newProduct);
  }

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
