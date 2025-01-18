import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { HttpService } from '../../../services/http.service';
import { MatDialog } from '@angular/material/dialog';
import { SharingService } from '../../../services/sharing.service';
import { ConfirmationModalComponent } from '../../shared/confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-general-settings',
  imports: [],
  templateUrl: './general-settings.component.html',
  styleUrl: './general-settings.component.css',
})
export class GeneralSettingsComponent {
  router = inject(Router);
  dialog = inject(MatDialog);
  httpService = inject(HttpService);
  destroyRef = inject(DestroyRef);
  sharingService = inject(SharingService);

  ngOnInit(): void {
    this.sharingService.updateCurrentRoute('settings');
  }

  addToDoCategory() {
    this.router.navigateByUrl('settings/categories');
  }

  onResetClick() {
    const dialogRef = this.dialog.open(ConfirmationModalComponent, {
      width: '85%',
      enterAnimationDuration: '300ms',
      exitAnimationDuration: '300ms',
      panelClass: 'center-dialog',
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (result) {
          this.httpService
            .deleteAllCategories()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((data) => {
              console.log(data);
            });

          this.httpService
            .deleteAllReminders()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((data) => {
              console.log(data);
            });

          this.httpService
            .deleteAllGoals()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((data) => {
              console.log(data);

              this.router.navigateByUrl('home');
            });

          this.httpService
            .updateUserInfo({ taskCompleted: 0, name: '' })
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((data) => {
              console.log(data);
            });
        }
      });
  }

  onAddToDoClick() {
    this.router.navigateByUrl('settings/todo-list');
  }

  onLogOut() {
    localStorage.removeItem('goal-token');
    this.router.navigateByUrl('login');
  }

  onCertificatesClick() {
    this.router.navigateByUrl('settings/certificates');
  }
}
