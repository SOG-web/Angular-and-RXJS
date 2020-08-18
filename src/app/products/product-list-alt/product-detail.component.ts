import { Component, ChangeDetectionStrategy } from '@angular/core';

import { ProductService } from '../product.service';
import { catchError, tap, map, filter } from 'rxjs/operators';
import { EMPTY, Subject, from, combineLatest } from 'rxjs';
import { Product } from '../product';

@Component({
  selector: 'pm-product-detail',
  templateUrl: './product-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetailComponent {
  constructor(private productService: ProductService) {}

  private errorMessageSubject = new Subject<string>();
  errorMessage$ = this.errorMessageSubject.asObservable();

  // Product to display
  product$ = this.productService.selectedProduct$.pipe(
    // tap((product) => console.log(product)),
    catchError((err) => {
      this.errorMessageSubject.next(err);
      return EMPTY;
    })
  );

  // Set the page title
  pageTitle$ = this.product$.pipe(
    map((p: Product) => (p ? `Product Detail for: ${p.productName}` : null))
  );

  // Suppliers for this product
  productSuppliers$ = this.productService.selectedProductSuppliers$.pipe(
    catchError((err) => {
      this.errorMessageSubject.next(err);
      return EMPTY;
    })
  );

  // combining all streams
  // Create a combined stream with the data used in the view
  // Use filter to skip if the product is null
  viewModel$ = combineLatest([
    this.pageTitle$,
    this.productSuppliers$,
    this.pageTitle$,
  ]).pipe(
    // the filter to boolean is to escape undefine on the component first load
    filter(([product]) => Boolean(product)),
    map(([product, productSupplier, pageTitle]) => ({
      product,
      productSupplier,
      pageTitle,
    }))
  );
}
