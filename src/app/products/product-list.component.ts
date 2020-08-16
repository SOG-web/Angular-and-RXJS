import { Component } from '@angular/core';

import { EMPTY, Subject, combineLatest, BehaviorSubject } from 'rxjs';

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

  private categorySelectedSubject = new BehaviorSubject<number>(0);
  categorySelectedAction$ = this.categorySelectedSubject.asObservable();

  categories$ = this.productCategoryService.productsCategories$.pipe(
    catchError((err) => {
      this.errorMessage = err;
      return EMPTY;
    })
  );

  products$ = combineLatest([
    this.productService.ProductWithCategory$,
    this.categorySelectedAction$,
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

  onAdd(): void {
    console.log('Not yet implemented');
  }

  onSelected(categoryId: string): void {
    this.categorySelectedSubject.next(+categoryId);
  }
}
