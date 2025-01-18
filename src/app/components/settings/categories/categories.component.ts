import { Component, inject } from '@angular/core';
import { DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { HttpService } from '../../../services/http.service';
import { SharingService } from '../../../services/sharing.service';

@Component({
  selector: 'app-categories',
  imports: [DragDropModule],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.css',
})
export class CategoriesComponent {
  router = inject(Router);
  httpService = inject(HttpService);
  sharingService = inject(SharingService);
  toastrService = inject(ToastrService);

  categories: any[] = [];

  ngOnInit(): void {
    this.sharingService.updateCurrentRoute('settings/add-todo');

    this.httpService.getAllCategories().subscribe((data: any) => {
      this.categories = data;
      this.categories.sort((a, b) => a.index - b.index);
      console.log(this.categories);
    });
  }
  onBackClick() {
    this.router.navigateByUrl('settings');
  }

  onAddToDoClick() {
    this.sharingService.updateComingFrom(null);
    this.sharingService.updateCategoryToEdit(null);
    this.router.navigateByUrl('settings/to-do-form');
  }

  drop(event: any) {
    moveItemInArray(this.categories, event.previousIndex, event.currentIndex);
    this.categories.forEach((category, i) => {
      category.index = i;

      this.httpService
        .updateCategory(category._id, category)
        .subscribe((res) => {});
    });
  }

  onEditClick(category: any) {
    this.sharingService.updateCategoryToEdit(category);
    this.router.navigateByUrl('settings/to-do-form');
  }

  onDeleteClick(event: any, category: any) {
    event.stopPropagation();
    this.httpService.deleteCategory(category._id).subscribe(() => {
      this.toastrService.success('Category deleted successfully', '', {
        timeOut: 2500,
      });

      this.httpService.getAllCategories().subscribe((data: any) => {
        this.categories = data;
        this.categories.sort((a, b) => a.index - b.index);
      });
    });
  }
}
