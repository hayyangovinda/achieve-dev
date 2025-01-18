import { NgFor } from '@angular/common';
import { Component, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'app-rating',
  imports: [NgFor],
  templateUrl: './rating.component.html',
  styleUrl: './rating.component.css',
})
export class RatingComponent implements OnChanges {
  @Input() rating!: number;
  @Input() totalStars: number = 5; // default to 5 stars if not provided

  stars: number[] = [];

  ngOnChanges(changes: any): void {
    if (changes.totalStars || changes.rating) {
      this.updateStarsArray();
    }
  }

  private updateStarsArray(): void {
    this.stars = Array(this.totalStars).fill(0);
  }
}
