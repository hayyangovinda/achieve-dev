import { Component, inject, ViewChildren } from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { HttpService } from '../../../services/http.service';
import { SharingService } from '../../../services/sharing.service';
import { UtilsService } from '../../../services/utils.service';
import {
  IStepOption,
  TourMatMenuModule,
  TourService,
} from 'ngx-ui-tour-md-menu';
import { capitalize } from 'lodash';
import { trigger, transition, style, animate } from '@angular/animations';
import {
  provideNativeDateAdapter,
  MAT_DATE_LOCALE,
} from '@angular/material/core';
import { NgFor, NgIf } from '@angular/common';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';

@Component({
  selector: 'app-todo-form',
  imports: [
    PickerComponent,
    TourMatMenuModule,
    ReactiveFormsModule,
    NgIf,
    NgFor,
    MatFormFieldModule,
    MatDatepickerModule,
    RouterModule,
  ],
  templateUrl: './todo-form.component.html',
  styleUrl: './todo-form.component.css',
  animations: [
    trigger('myInsertRemoveTrigger', [
      transition(':enter', [
        style({ opacity: 1 }),
        animate('100ms', style({ opacity: 1 })),
      ]),
      transition(':leave', [animate('100ms', style({ opacity: 1 }))]),
    ]),
  ],
  providers: [
    provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
  ],
})
export class TodoFormComponent {
  @ViewChildren('taskInput') taskInputs: any;
  categoryToEdit!: any;
  router = inject(Router);
  httpService = inject(HttpService);
  toastrService = inject(ToastrService);
  sharingService = inject(SharingService);
  utilsService = inject(UtilsService);
  tourService = inject(TourService);
  showPicker = false;
  filledTaskInputs = [];
  numberOfTaskInput = 0;
  showTaskOptionArray: boolean[] = [];
  taskFormArray = new FormArray<any>([]);
  categoryForm = new FormGroup({
    icon: new FormControl(''),
    name: new FormControl(''),

    tasks: this.taskFormArray,
  });
  repeatedDaysStore = {};
  durationStore: any = {};
  comingFrom!: any;

  daysSelectedStore: any = {};

  tourSteps: IStepOption[] = [
    {
      anchorId: 'icon',
      title: 'Icon',
      content:
        'Add an icon to your category. This icon will be displayed in the home page.',
    },
    {
      anchorId: 'category',
      title: 'Category',
      content:
        'The category helps you to categorize your tasks. for example, you can categorize your tasks as "Personal", "Work", "Family" etc.',
    },

    {
      anchorId: 'taskName0',
      title: 'Task Name',
      content:
        'Add a name to your task. This name will be displayed in the home page.',
    },
    {
      anchorId: 'showTaskOptions0',
      content: 'Click on the drop-down icon to show / hide the task options.',
    },

    {
      anchorId: 'repeatOn0',
      title: 'Repeat On',
      content:
        'Choose the days on which you want to repeat your task. You can choose multiple days.',
    },

    {
      anchorId: 'duration0',
      title: 'Duration',
      content:
        'Customize the duration of your task,choose the start and end date.',
    },

    {
      anchorId: 'pause0',
      title: 'Pause',
      content:
        'You can pause your task. This will prevent your task from being displayed in the home page.You can resume it later.',
    },

    {
      anchorId: 'delete0',
      title: 'Delete',
      content:
        'Click on the delete icon to delete your task from this category.',
    },
  ];

  ngOnInit(): void {
    this.sharingService.updateCurrentRoute('settings/todo-form');
    this.showTaskOptionArray[0] = true;
    this.tourService.initialize(this.tourSteps);

    setTimeout(() => {
      this.startTour();
    }, 100);

    this.categoryToEdit = this.sharingService.categoryToEdit();

    if (this.categoryToEdit) {
      this.categoryToEdit.tasks.forEach((task: any, index: number) => {
        this.addTaskInput(task);
        const startDate = task.startDate;
        const endDate = task.endDate;
        if (startDate && endDate) {
          const numberOfDays = this.utilsService.getNumberOfDays(
            new Date(startDate),
            new Date(endDate)
          );

          this.durationStore[index] = numberOfDays;
        }
      });

      this.categoryForm.patchValue({
        icon: this.categoryToEdit.icon,
        name: this.categoryToEdit.name,
      });
    }

    if (this.sharingService.comingFrom() === 'home') {
      this.comingFrom = this.sharingService.comingFrom();
    }

    this.addTaskInput();
  }

  emojiClick(event: any) {
    this.categoryForm.get('icon')?.setValue(event.emoji.native);
    this.showPicker = false;
  }

  onIconFocus(event: any) {
    event.preventDefault();
    this.showPicker = true;
  }

  onSaveClick() {
    let tasks = this.categoryForm.value.tasks.filter(
      (task: any) => task.name !== ''
    );

    let taskObjArray = tasks.map((task: any, index: number) => {
      let startDateString = null;
      let endDateString = null;
      if (task.startDate && task.endDate) {
        let startDate = new Date(task.startDate);
        let endDate = new Date(task.endDate);

        startDateString =
          this.utilsService.formatDateToStartOfDayUTC(startDate);
        endDateString = this.utilsService.formatDateToStartOfDayUTC(endDate);
      }
      let duration = this.durationStore[index];
      if (this.durationStore[index] === 'Forever') {
        duration = null;
      }
      return {
        name: capitalize(task.name),
        done: false,
        repeatOn: {
          monday: task.monday,
          tuesday: task.tuesday,
          wednesday: task.wednesday,
          thursday: task.thursday,
          friday: task.friday,
          saturday: task.saturday,
          sunday: task.sunday,
        },
        paused: task.paused,
        startDate: startDateString,
        endDate: endDateString,
        duration,
      };
    });

    const body = {
      icon: this.categoryForm.value.icon,
      name: capitalize(this.categoryForm.value.name as string),
      tasks: taskObjArray,
    };

    if (this.categoryToEdit) {
      this.httpService
        .updateCategory(this.categoryToEdit._id, body)
        .subscribe((data) => {
          this.toastrService.success('Category updated', '', { timeOut: 2500 });
        });
      return;
    }

    this.httpService.createCategory(body).subscribe((data) => {
      this.toastrService.success('Category created', '', { timeOut: 2500 });

      this.router.navigateByUrl('home');
    });
  }

  onIconBlur() {
    setTimeout(() => {
      this.showPicker = false;
    }, 100);
  }

  onBackClick() {
    if (this.comingFrom === 'home') {
      this.router.navigateByUrl('home');
      return;
    }

    this.router.navigateByUrl('settings/categories');
  }

  checkFilledTaskInput() {
    this.filledTaskInputs = this.taskInputs
      .toArray()
      .filter((task: any) => task.nativeElement.value !== '');

    if (this.filledTaskInputs.length === this.numberOfTaskInput) {
      this.addTaskInput();
    }
  }

  addTaskInput(task: any = {}) {
    const formGroup = new FormGroup({
      name: new FormControl(task.name || ''),
      monday: new FormControl(task.repeatOn?.monday ?? true),
      tuesday: new FormControl(task.repeatOn?.tuesday ?? true),
      wednesday: new FormControl(task.repeatOn?.wednesday ?? true),
      thursday: new FormControl(task.repeatOn?.thursday ?? true),
      friday: new FormControl(task.repeatOn?.friday ?? true),
      saturday: new FormControl(task.repeatOn?.saturday ?? true),
      sunday: new FormControl(task.repeatOn?.sunday ?? true),
      paused: new FormControl(task.paused ?? false),
      startDate: new FormControl(task.startDate || ''),
      endDate: new FormControl(task.endDate || ''),
    });

    (<FormArray>this.categoryForm.get('tasks')).push(formGroup);
    this.showTaskOptionArray.push(false);
    this.numberOfTaskInput++;
    const taskIndex = this.numberOfTaskInput - 1;

    this.daysSelectedStore[taskIndex] = 'Everyday';
    this.durationStore[taskIndex] = 'Forever';
    let selectedDays: any = [];

    (<FormArray>this.categoryForm.get('tasks'))
      .at(taskIndex)
      .valueChanges.subscribe((data) => {
        selectedDays = [];
        this.daysSelectedStore[taskIndex] = '';
        const monday = data.monday;
        const tuesday = data.tuesday;
        const wednesday = data.wednesday;
        const thursday = data.thursday;
        const friday = data.friday;
        const saturday = data.saturday;
        const sunday = data.sunday;
        const startDate = data.startDate;
        const endDate = data.endDate;

        if (monday) selectedDays.push('Mon');
        if (tuesday) selectedDays.push('Tues');
        if (wednesday) selectedDays.push('Wed');
        if (thursday) selectedDays.push('Thu');
        if (friday) selectedDays.push('Fri');
        if (saturday) selectedDays.push('Sat');
        if (sunday) selectedDays.push('Sun');

        this.daysSelectedStore[taskIndex] = selectedDays.join(', ');
        if (selectedDays.length === 7) {
          this.daysSelectedStore[taskIndex] = 'Everyday';
        }
        if (selectedDays.length === 0) {
          this.daysSelectedStore[taskIndex] = 'Never';
        }

        if (startDate && endDate) {
          const numberOfDays = this.utilsService.getNumberOfDays(
            startDate,
            endDate
          );

          this.durationStore[taskIndex] = numberOfDays;
        }
      });
  }

  showTaskOptions(index: number) {
    this.showTaskOptionArray[index] = !this.showTaskOptionArray[index];
  }

  onDayClick(index: number, day: string) {}
  onOverlayClick() {
    this.showPicker = false;
  }

  onDurationClick(index: number) {
    (<FormArray>this.categoryForm.get('tasks'))
      ?.at(index)
      ?.get('startDate')
      ?.setValue(null);
    (<FormArray>this.categoryForm.get('tasks'))
      ?.at(index)
      ?.get('endDate')
      ?.setValue(null);
    (<FormArray>this.categoryForm.get('tasks'))
      ?.at(index)
      ?.get('duration')
      ?.setValue('Forever');

    this.durationStore[index] = 'Forever';
  }

  startTour() {
    this.tourService.start();
  }
}
