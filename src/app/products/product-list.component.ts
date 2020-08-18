import { Component } from '@angular/core';

import { EMPTY, Subject, combineLatest } from 'rxjs';

import { ProductService } from './product.service';
import { catchError, map, startWith } from 'rxjs/operators';
import { ChangeDetectionStrategy } from '@angular/core';
import { ProductCategoryService } from '../product-categories/product-category.service';

@Component({
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
  // For this to work we must write reactive code in our service
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductListComponent {
  constructor(
    private productService: ProductService,
    private productCategoryService: ProductCategoryService
  ) {}
  pageTitle = 'Product List';
  errorMessage = '';

  // Action stream
  private categorySelectedSubject = new Subject<number>();
  categorySelectedAction$ = this.categorySelectedSubject.asObservable();

  // Categories for drop down list
  categories$ = this.productCategoryService.productsCategories$.pipe(
    catchError((err) => {
      this.errorMessage = err;
      return EMPTY;
    })
  );

  // Merge Data stream with Action stream
  // To filter to the selected category
  products$ = combineLatest([
    // since product with add has merge both the ProductWithCategory$ and the rest so we will have access to the category name
    this.productService.productWithAdd$,
    this.categorySelectedAction$.pipe(startWith(0)),
  ]).pipe(
    map(([products, selectedCategoryId]) =>
      products.filter((product) =>
        selectedCategoryId ? product.categoryId === selectedCategoryId : true
      )
    ),
    catchError((err) => {
      this.errorMessage = err;
      return EMPTY;
    })
  );

  // Combine all streams for the view
  viewModel$ = combineLatest([this.products$, this.categories$]).pipe(
    map(([products, categories]) => ({ products, categories }))
  );

  onAdd(): void {
    // instead of empty in a real word app it can be the form value
    this.productService.addProduct();
  }

  onSelected(categoryId: string): void {
    this.categorySelectedSubject.next(+categoryId);
  }
}
