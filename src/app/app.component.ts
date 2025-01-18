import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TabsComponent } from './components/shared/tabs/tabs.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TabsComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'achieve';
}
