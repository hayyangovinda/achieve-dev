import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  constructor() {}
  http = inject(HttpClient);

  url = 'https://achieve-api.onrender.com/api/v1';

  // url = 'http://localhost:5000/api/v1';
  getAllCategories() {
    return this.http.get(`${this.url}/categories`);
  }

  getCategory(id: string) {
    return this.http.get(`${this.url}/categories/${id}`);
  }

  updateCategory(id: string, category: any) {
    return this.http.patch(`${this.url}/categories/${id}`, category);
  }

  deleteCategory(id: string) {
    return this.http.delete(`${this.url}/categories/${id}`);
  }

  createCategory(category: any) {
    return this.http.post(`${this.url}/categories`, category);
  }

  deleteAllCategories() {
    return this.http.delete(`${this.url}/categories`);
  }

  getAllGoals(date?: any) {
    let params = new HttpParams();
    if (date) {
      params = params.set('date', date);
    }
    return this.http.get(`${this.url}/goals`, { params });
  }

  deleteAllGoals() {
    return this.http.delete(`${this.url}/goals`);
  }

  createGoal(goal: any) {
    return this.http.post(`${this.url}/goals`, goal);
  }

  updateGoal(goal: any, date?: any) {
    let params = new HttpParams();
    if (date) {
      params = params.set('date', date);
    }
    return this.http.patch(`${this.url}/goals/${goal._id}`, goal, { params });
  }

  updateTask(goalId: any, categoryId: any, taskId: any, body: any) {
    return this.http.patch(
      `${this.url}/goals/${goalId}/${categoryId}/${taskId}`,
      body
    );
  }

  register(body: any) {
    return this.http.post(`${this.url}/auth/register`, body);
  }

  login(body: any) {
    return this.http.post(`${this.url}/auth/login`, body);
  }

  sendVerificationEmail(body: any) {
    return this.http.post(`${this.url}/auth/send-email`, body);
  }

  checkVerificationStatus(body: any) {
    return this.http.post(`${this.url}/auth/check-verification-status`, body);
  }

  getAllReminders(date?: any) {
    let params = new HttpParams();
    if (date) {
      params = params.set('date', date);
    }
    return this.http.get(`${this.url}/reminders`, { params });
  }

  createReminder(body: any) {
    return this.http.post(`${this.url}/reminders`, body);
  }

  updateReminder(reminder: any) {
    return this.http.patch(`${this.url}/reminders/${reminder._id}`, reminder);
  }

  deleteReminder(reminderId: any) {
    return this.http.delete(`${this.url}/reminders/${reminderId}`);
  }

  deleteAllReminders() {
    return this.http.delete(`${this.url}/reminders`);
  }

  forgotPassword(body: any) {
    return this.http.post(`${this.url}/auth/forgot-password`, body);
  }

  getUserInfo() {
    return this.http.get(`${this.url}/users/active-user`);
  }

  updateUserInfo(body: any) {
    return this.http.patch(`${this.url}/users/active-user`, body);
  }
}
