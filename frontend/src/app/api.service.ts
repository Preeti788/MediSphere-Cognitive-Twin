import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';

import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  // =========================
  // COMMON HEADERS
  // =========================

  private headers(): HttpHeaders {

    const token = localStorage.getItem('medisphere_token');

    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    if (token) {
      headers = headers.set(
        'Authorization',
        `Bearer ${token}`
      );
    }

    return headers;
  }

  // =========================
  // LOGIN
  // =========================

  login(
    emailOrBody: string | { email: string; password: string },
    password?: string
  ): Observable<any> {

    const body =
      typeof emailOrBody === 'string'
        ? {
            email: emailOrBody,
            password: password ?? ''
          }
        : emailOrBody;

    return this.http.post<any>(
      `${this.baseUrl}/auth/login`,
      body,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      }
    );
  }

  // =========================
  // GET
  // =========================

  get<T>(path: string): Observable<T> {

    return this.http.get<T>(
      `${this.baseUrl}${path}`,
      {
        headers: this.headers()
      }
    );
  }

  // =========================
  // POST
  // =========================

  post<T>(
    path: string,
    body: any
  ): Observable<T> {

    return this.http.post<T>(
      `${this.baseUrl}${path}`,
      body,
      {
        headers: this.headers()
      }
    );
  }

  // =========================
  // PUT
  // =========================

  put<T>(
    path: string,
    body: any
  ): Observable<T> {

    return this.http.put<T>(
      `${this.baseUrl}${path}`,
      body,
      {
        headers: this.headers()
      }
    );
  }

  // =========================
  // DELETE
  // =========================

  delete<T>(
    path: string
  ): Observable<T> {

    return this.http.delete<T>(
      `${this.baseUrl}${path}`,
      {
        headers: this.headers()
      }
    );
  }

  // =========================
  // PATCH
  // =========================

  patch<T>(
    path: string,
    body: any
  ): Observable<T> {

    return this.http.patch<T>(
      `${this.baseUrl}${path}`,
      body,
      {
        headers: this.headers()
      }
    );
  }
}