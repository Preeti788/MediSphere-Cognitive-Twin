import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';

import { Observable, BehaviorSubject, finalize } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private baseUrl = 'http://localhost:8080/api';

  private activeRequests = 0;

  private loadingState =
    new BehaviorSubject<boolean>(false);

  readonly loading$ =
    this.loadingState.asObservable();

  constructor(
    private http: HttpClient
  ) {}

  // =====================================================
  // GLOBAL LOADING CONTROL
  // =====================================================

  private track<T>(
    request: Observable<T>
  ): Observable<T> {

    this.activeRequests++;

    this.loadingState.next(true);

    return request.pipe(

      finalize(() => {

        this.activeRequests =
          Math.max(
            0,
            this.activeRequests - 1
          );

        this.loadingState.next(
          this.activeRequests > 0
        );

      })

    );
  }

  // =====================================================
  // COMMON HEADERS
  // =====================================================

  private headers(): HttpHeaders {

    const token =
      localStorage.getItem(
        'medisphere_token'
      );

    let headers =
      new HttpHeaders({
        'Content-Type':
          'application/json'
      });

    if (token) {

      headers =
        headers.set(
          'Authorization',
          `Bearer ${token}`
        );

    }

    return headers;
  }

  // =====================================================
  // LOGIN
  // =====================================================

  login(
    emailOrBody:
      string |
      {
        identifier: string;
        password: string;
      },

    password?: string

  ): Observable<any> {

    const body =
      typeof emailOrBody === 'string'

        ? {
            identifier: emailOrBody,
            password: password ?? ''
          }

        : emailOrBody;

    return this.track(

      this.http.post<any>(

        `${this.baseUrl}/auth/login`,

        body,

        {
          headers:
            new HttpHeaders({
              'Content-Type':
                'application/json'
            })
        }

      )

    );

  }

  // =====================================================
  // GET
  // =====================================================

  get<T>(
    path: string,
    showLoading: boolean = true
  ): Observable<T> {

    const request =
      this.http.get<T>(

        `${this.baseUrl}${path}`,

        {
          headers:
            this.headers()
        }

      );

    /*
     * showLoading = true
     * -----------------
     * Used for important user actions.
     *
     * showLoading = false
     * ------------------
     * Used for background
     * monitoring / refresh
     * requests.
     */

    return showLoading
      ? this.track(request)
      : request;

  }

  // =====================================================
  // POST
  // =====================================================

  post<T>(
    path: string,
    body: any,
    showLoading: boolean = true
  ): Observable<T> {

    const request =
      this.http.post<T>(

        `${this.baseUrl}${path}`,

        body,

        {
          headers:
            this.headers()
        }

      );

    return showLoading
      ? this.track(request)
      : request;

  }

  // =====================================================
  // MULTIPART UPLOAD
  // =====================================================

  upload<T>(
    path: string,
    formData: FormData,
    showLoading: boolean = true
  ): Observable<T> {

    const token =
      localStorage.getItem(
        'medisphere_token'
      );

    let headers =
      new HttpHeaders();

    /*
     * DO NOT set Content-Type manually
     * for FormData.
     *
     * Browser automatically adds:
     *
     * multipart/form-data;
     * boundary=...
     */

    if (token) {

      headers =
        headers.set(
          'Authorization',
          `Bearer ${token}`
        );

    }

    const request =
      this.http.post<T>(

        `${this.baseUrl}${path}`,

        formData,

        {
          headers
        }

      );

    return showLoading
      ? this.track(request)
      : request;

  }

  // =====================================================
  // PUT
  // =====================================================

  put<T>(
    path: string,
    body: any,
    showLoading: boolean = true
  ): Observable<T> {

    const request =
      this.http.put<T>(

        `${this.baseUrl}${path}`,

        body,

        {
          headers:
            this.headers()
        }

      );

    return showLoading
      ? this.track(request)
      : request;

  }

  // =====================================================
  // DELETE
  // =====================================================

  delete<T>(
    path: string,
    showLoading: boolean = true
  ): Observable<T> {

    const request =
      this.http.delete<T>(

        `${this.baseUrl}${path}`,

        {
          headers:
            this.headers()
        }

      );

    return showLoading
      ? this.track(request)
      : request;

  }

  // =====================================================
  // PATCH
  // =====================================================

  patch<T>(
    path: string,
    body: any,
    showLoading: boolean = true
  ): Observable<T> {

    const request =
      this.http.patch<T>(

        `${this.baseUrl}${path}`,

        body,

        {
          headers:
            this.headers()
        }

      );

    return showLoading
      ? this.track(request)
      : request;

  }

}