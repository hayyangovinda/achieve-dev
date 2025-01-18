import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SharingService {
  constructor() {}

  currentRoute = signal('');

  updateCurrentRoute(route: string) {
    this.currentRoute.set(route);
  }

  comingFrom = signal(null);

  updateComingFrom(route: any) {
    this.comingFrom.set(route);
  }
}
