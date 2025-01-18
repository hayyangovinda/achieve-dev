import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SharingService } from '../../services/sharing.service';

@Component({
  selector: 'app-tabs',
  imports: [],
  templateUrl: './tabs.component.html',
  styleUrl: './tabs.component.css',
})
export class TabsComponent implements OnInit {
  router = inject(Router);
  currentRoute = '';
  sharingService = inject(SharingService);

  ngOnInit(): void {}
}
