import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class CustomHttpInterceptorService implements HttpInterceptor {

  constructor(private userService: UserService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Clone the request to add the new header
    const clonedRequest = req.clone({
      headers: req.headers.set('Application', 'beauty')
    });

    // Capture the request body for logging purposes
    const requestBody = req.method === 'POST' ? req.body : null;

    // Pass the cloned request instead of the original request to the next handle
    return next.handle(clonedRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status >= 400 && error.status !== 401 && error.status !== 403 && error.status !== 404 && error.status !== 409) {
          // Log the error if status is 400 or greater and not 401, 403, 404, or 409
          const logMessage = `Error ${error.status}: ${error.message}`;
          this.userService.logMessage(logMessage, 'ERROR', requestBody);

          if (error.status === 429) {
            this.userService.presentToast('Έχετε υπερβεί το όριο προσπαθειών. Παρακαλώ ξανά προσπαθήστε σε 10 λεπτά', 'danger');
          }
        }
        return throwError(error);
      })
    );
  }
}
