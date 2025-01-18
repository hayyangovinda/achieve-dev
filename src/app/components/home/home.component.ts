import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { HttpService } from '../../services/http.service';
import { UtilsService } from '../../services/utils.service';
import { SharingService } from '../../services/sharing.service';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RatingComponent } from '../shared/rating/rating.component';
import { LoaderComponent } from '../shared/loader/loader.component';

@Component({
  selector: 'app-home',
  imports: [RatingComponent, LoaderComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  httpService = inject(HttpService);
  utilsService = inject(UtilsService);
  sharingService = inject(SharingService);
  categories: any[] = [];
  showTasks = false;
  today = new Date('2024-07-09'); // '2024-06-23'
  router = inject(Router);
  todayGoal!: any;
  showmodal = false;
  todayFormatted = '';
  reminders: any = [];
  showReminders = false;
  doneRemindersArray: any = [];
  reminderCompleteImgPath = '';
  templateReminders: any = [];
  templateCategories: any = [];
  UserTotalTasksCompleted!: number;
  destroyRef = inject(DestroyRef);
  showLoader = false;

  ngOnInit(): void {
    this.sharingService.updateCurrentRoute('home');
    this.showLoader = true;
    this.httpService
      .getUserInfo()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((user: any) => {
        console.log({ user });
        this.UserTotalTasksCompleted = user.taskCompleted;
      });

    this.todayFormatted = this.utilsService.formatDateToStartOfDayUTC(
      this.today
    );

    this.httpService
      .getAllReminders(this.todayFormatted)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data: any) => {
        this.templateReminders = data;
      });

    this.httpService
      .getAllCategories()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data: any) => {
        if (data.length == 0) {
          this.showmodal = true;
          this.showLoader = false;
        }
        const templateCategories = data;
        this.templateCategories = templateCategories;

        this.categories.sort((a, b) => a.index - b.index);
        let totalTasks = 0;
        templateCategories.forEach((element: any) => {
          const filteredTasks = this.filterTasks(element.tasks);
          element.tasks.forEach((task: any) => {
            task.dateDone = this.todayFormatted;
          });
          // delete element._id;
          totalTasks += filteredTasks.length;
          templateCategories.totalTasks = totalTasks;
        });

        if (templateCategories.length || this.templateReminders.length) {
          this.httpService
            .getAllGoals(this.todayFormatted)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((data: any) => {
              if (!data.length) {
                this.httpService
                  .createGoal({
                    date: new Date(this.todayFormatted),
                    categories: templateCategories,
                    totalTasks: totalTasks + this.templateReminders.length,
                    reminders: this.templateReminders,
                  })
                  .pipe(takeUntilDestroyed(this.destroyRef))
                  .subscribe((data2: any) => {
                    this.todayGoal = data2;

                    this.categories = this.todayGoal.categories;

                    this.reminders = this.todayGoal.reminders;
                    this.getRemindersResult();

                    this.filterCategories(this.categories);

                    this.categories.sort((a, b) => a.index - b.index);

                    this.addImgtoCategory();
                    this.showLoader = false;
                  });
              } else {
                this.todayGoal = data[0];

                this.categories = this.todayGoal?.categories;

                this.reminders = this.todayGoal?.reminders;
                this.getRemindersResult();

                this.filterCategories(this.categories);

                this.categories.sort((a, b) => a.index - b.index);

                this.addImgtoCategory();

                this.showLoader = false;

                if (
                  this.todayGoal.categories?.length !==
                    templateCategories.length ||
                  this.categories[0]?.version !==
                    templateCategories[0]?.version ||
                  this.todayGoal.reminders.length !==
                    this.templateReminders.length
                ) {
                  this.retrieveGoalTasksInfo();
                  this.todayGoal.categories = this.templateCategories;
                  this.todayGoal.reminders = this.templateReminders;

                  this.todayGoal.totalTasks =
                    totalTasks + this.templateReminders.length;
                  this.httpService
                    .updateGoal(this.todayGoal)
                    .pipe(takeUntilDestroyed(this.destroyRef))
                    .subscribe((updatedGoal) => {
                      this.todayGoal = updatedGoal;
                      this.categories = this.todayGoal.categories;
                      this.reminders = this.todayGoal.reminders;
                      this.getRemindersResult();

                      this.filterCategories(this.categories);

                      this.categories.sort((a, b) => a.index - b.index);

                      this.addImgtoCategory();
                      this.showLoader = false;
                    });
                }
              }
            });
        }
      });
  }

  onCategoryClick(category: any) {
    category.showTasks = !category.showTasks;
    this.httpService
      .updateGoal(this.todayGoal)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data) => {});
  }

  onCheckBoxClick(event: Event, category: any, task: any) {
    task.done = !task.done;

    if (task.done) {
      category.tasksDone++;
      this.todayGoal.totalTasksCompleted++;
      this.UserTotalTasksCompleted++;
    } else {
      category.tasksDone--;
      this.todayGoal.totalTasksCompleted--;
      this.UserTotalTasksCompleted--;
    }

    this.getGoalResult(this.todayGoal);
    const body = { done: task.done };

    if (category.tasks.length === category.tasksDone) {
      category.completeImgPath = 'public/tup.png';
    } else {
      category.completeImgPath = 'public/tdown.png';
    }

    this.httpService
      .updateUserInfo({ taskCompleted: this.UserTotalTasksCompleted })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data) => {
        console.log(data);
      });

    this.httpService
      .updateGoal(this.todayGoal)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data) => {});
  }

  onReminderCheckBoxCick(reminder: any) {
    reminder.done = !reminder.done;

    this.doneRemindersArray = this.reminders.filter(
      (reminder: any) => reminder.done
    );

    if (reminder.done) {
      this.todayGoal.totalTasksCompleted++;
      this.todayGoal.remindersCompleted++;
      this.UserTotalTasksCompleted++;
    } else {
      this.todayGoal.remindersCompleted--;
      this.todayGoal.totalTasksCompleted--;
      this.UserTotalTasksCompleted--;
    }

    this.getRemindersResult();
    this.getGoalResult(this.todayGoal);
    this.httpService
      .updateUserInfo({ taskCompleted: this.UserTotalTasksCompleted })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data) => {
        console.log('usercomplete', data);
      });

    this.httpService
      .updateGoal(this.todayGoal)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data) => {});
  }

  addImgtoCategory() {
    this.categories?.forEach((category) => {
      if (category.tasks.length === category.tasksDone) {
        category.completeImgPath = 'public/tup.png';
      } else {
        category.completeImgPath = 'public/tdown.png';
      }
    });
  }

  onCreateGoalClick() {
    this.sharingService.updateComingFrom('home');
    this.router.navigateByUrl('settings/to-do-form');
  }

  filterCategories(categories: any[]) {
    categories.forEach((category) => {
      category.tasks = this.filterTasks(category.tasks);
    });
  }

  filterTasks(tasks: any[]) {
    const filteredTasks = tasks.filter((task) => {
      const dayname = this.utilsService.getDayName(this.today);
      const isPaused = task.paused;

      const isTodayOn = task.repeatOn[dayname];

      let startDate = task.startDate;
      let endDate = task.endDate;

      let isInDateRange = true;

      if (startDate && endDate) {
        startDate = new Date(startDate);
        endDate = new Date(endDate);
        isInDateRange = this.today >= startDate && this.today <= endDate;
      }

      if (!isPaused && isTodayOn && isInDateRange) {
        task.showInRecord = true;
      }

      return !isPaused && isTodayOn && isInDateRange;
    });

    return filteredTasks;
  }

  getGoalResult(goal: any) {
    const percentageCompleted = goal.totalTasksCompleted / goal.totalTasks;
    goal.result = '';
    if (percentageCompleted < 0.3) {
      goal.result = 'fail';
    }
    if (percentageCompleted >= 0.3) {
      goal.result = 'bronze';
    }

    if (percentageCompleted >= 0.5) {
      goal.result = 'silver';
    }

    if (percentageCompleted >= 0.7) {
      goal.result = 'gold';
    }

    if (percentageCompleted === 1) {
      goal.result = 'trophy';
    }
    if (goal.date === this.todayFormatted) {
      this.httpService
        .updateGoal(goal)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((data) => {});
    }
  }

  getRemindersResult() {
    this.doneRemindersArray = this.reminders.filter(
      (reminder: any) => reminder.done
    );

    if (this.reminders.length === this.doneRemindersArray.length) {
      this.reminderCompleteImgPath = 'public/tup.png';
    } else {
      this.reminderCompleteImgPath = 'public/tdown.png';
    }
  }

  onReminderClick() {
    this.showReminders = !this.showReminders;
  }

  retrieveGoalTasksInfo() {
    const goalTasks: any = [];

    this.todayGoal.categories.forEach((goalCategory: any) => {
      goalTasks.push(...goalCategory.tasks);

      const category = this.templateCategories.find(
        (templateCategory: any) => templateCategory._id === goalCategory._id
      );

      if (category) {
        category.tasksDone = goalCategory.tasksDone;
      }
    });

    this.templateCategories.forEach((category: any) => {
      category.tasks.forEach((categoryTask: any) => {
        const task = goalTasks.find(
          (goalTask: any) => goalTask._id === categoryTask._id
        );

        if (task) {
          categoryTask.done = task.done;
          categoryTask.tasksDone = task.tasksDone;
        }
      });
    });

    this.todayGoal.reminders.forEach((goalReminder: any) => {
      const reminder = this.templateReminders.find(
        (templateReminder: any) => templateReminder._id === goalReminder._id
      );

      if (reminder) {
        reminder.done = goalReminder.done;
      }
    });

    this.doneRemindersArray = this.reminders.filter(
      (reminder: any) => reminder.done
    );
    const totalTasksCompletedArray = goalTasks.filter((task: any) => task.done);

    this.todayGoal.remindersCompleted = this.doneRemindersArray.length;
    this.todayGoal.totalTasksCompleted =
      totalTasksCompletedArray.length + this.doneRemindersArray.length;
  }
}
