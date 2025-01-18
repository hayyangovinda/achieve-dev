import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { SharingService } from '../../../services/sharing.service';

@Component({
  selector: 'app-tabs',
  imports: [RouterModule],
  templateUrl: './tabs.component.html',
  styleUrl: './tabs.component.css',
})
export class TabsComponent implements OnInit {
  router = inject(Router);
  currentRoute = '';
  sharingService = inject(SharingService);

  ngOnInit(): void {
    this.currentRoute = this.sharingService.currentRoute();
    console.log('this.currentRoute: ', this.currentRoute);
  }

  onSettingsClick() {
    this.router.navigateByUrl('settings');
  }

  onHomeClick() {
    this.router.navigateByUrl('home');
  }

  onReportClick() {
    this.router.navigateByUrl('report');
  }

  onAchievementsClick() {
    this.router.navigateByUrl('achievements');
  }
}
