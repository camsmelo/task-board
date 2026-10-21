import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Task } from '../model/task.model';
import { environment } from '../../../../environments/environment.prod';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private readonly _httpCliente = inject(HttpClient);

  public tasks = signal<Task[]>([]);
  public numberOfTasks = computed(() => this.tasks().length);

  private readonly _apiUrl = environment.apiUrl;

  public getTasks(): Observable<Task[]> {
    return this._httpCliente.get<Task[]>(`${this._apiUrl}/tasks`).pipe(
      tap(tasks => {
        const sortedTasks = this.getSortedTasks(tasks);
        this.tasks.set(sortedTasks);
      })
    );
  }

  public insertATaskInATaskList(newTask: Task): void {
    const updatedTasks = [...this.tasks(), newTask];
    const sortedTasks = this.getSortedTasks(updatedTasks);
    this.tasks.set(sortedTasks);
  }

  public createTask(updatedTask: Partial<Task>): Observable<Task> {
    return this._httpCliente.post<Task>(
      `${this._apiUrl}/tasks/${updatedTask.id}`,
      updatedTask
    );
  }

  public updateTask(task: Task): Observable<Task> {
    return this._httpCliente.put<Task>(
      `${this._apiUrl}/tasks/${task.id}`,
      task
    );
  }

  deleteTask(taskId: string): Observable<Task> {
    return this._httpCliente.delete<Task>(`${this._apiUrl}/tasks/${taskId}`);
  }

  public updateIsCompletedStatus(
    taskId: string,
    isCompleted: boolean
  ): Observable<Task> {
    return this._httpCliente.patch<Task>(`${this._apiUrl}/tasks/${taskId}`, {
      isCompleted,
    });
  }

  public updateATaskInATaskList(updatedTask: Task): void {
    this.tasks.update(tasks => {
      const allTasksWithUpdatedTaskRemoved = tasks.filter(
        task => task.id !== updatedTask.id
      );
      const updatedTaskList = [...allTasksWithUpdatedTaskRemoved, updatedTask];
      return this.getSortedTasks(updatedTaskList);
    });
  }

  public deleteATaskInATaskList(taskId: string): void {
    this.tasks.update(tasks => tasks.filter(task => task.id !== taskId));
  }

  public getSortedTasks(tasks: Task[]): Task[] {
    return this.tasks().sort((a, b) => a.title.localeCompare(b.title));
  }
}
