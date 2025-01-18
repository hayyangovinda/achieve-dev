import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SharingService {
  constructor() {}

  categoryToEdit = signal(null);

  updateCategoryToEdit(category: any) {
    this.categoryToEdit.set(category);
  }

  currentRoute = signal('');

  updateCurrentRoute(route: string) {
    this.currentRoute.set(route);
  }

  comingFrom = signal(null);

  updateComingFrom(route: any) {
    this.comingFrom.set(route);
  }
}
