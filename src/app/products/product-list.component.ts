import { Component } from '@angular/core';

import { EMPTY } from 'rxjs';

import { ProductService } from './product.service';
import { catchError } from 'rxjs/operators';
import { ChangeDetectionStrategy } from '@angular/core';

@Component({
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
  // For this to work we must write reactive code in our service
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductListComponent {
  constructor(private productService: ProductService) {}
  pageTitle = 'Product List';
  errorMessage = '';
  categories;

  products$ = this.productService.ProductWithCategory$.pipe(
    catchError((err) => {
      this.errorMessage = err;
      return EMPTY;
    })
  );

  onAdd(): void {
    console.log('Not yet implemented');
  }

  onSelected(categoryId: string): void {
    console.log('Not yet implemented');
  }
}
