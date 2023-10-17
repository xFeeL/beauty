import { EventEmitter, Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Observable, catchError, map, of, switchMap, tap, throwError } from 'rxjs';
import { AppearanceAnimation, DialogLayoutDisplay, DisappearanceAnimation, ToastNotificationInitializer, ToastPositionEnum, ToastProgressBarEnum, ToastUserViewTypeEnum } from '@costlydeveloper/ngx-awesome-popup';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Push, PushObject, PushOptions } from '@awesome-cordova-plugins/push/ngx';
import { User } from '../models/user';
import { Router } from '@angular/router';
import { Message } from '../models/message';
import { expertData } from '../models/expertData';


let API_URL = "http://127.0.0.1:8080/api/common/";
let Authenticated_API_URL = "http://127.0.0.1:8080/api/common-auth/"
let beautyAuthenticated_API_URL = "http://127.0.0.1:8080/api/beauty-auth/"

@Injectable({
  providedIn: 'root'
})
export class UserService {

  /**
   * Holds navigation data.
   * @type {any}
   */
  navData: any;


  /**
 * The content type of the HTTP requests.
 * @type {string}
 */
  private readonly CONTENT_TYPE = 'application/json; charset=UTF-8';
  /**
* BehaviorSubject that holds the authentication status of the user.
* @param {boolean} localStorage.getItem('authenticated') - The initial value of the BehaviorSubject.
* @returns {BehaviorSubject<boolean>} - The BehaviorSubject that holds the authentication status of the user.
*/
  public _isAuthenticated = new BehaviorSubject<boolean>(localStorage.getItem('authenticated') === 'true');
  /**
   * Holds the event source for server-sent events.
   * @type {any}
   */
  eventSource: any;
  /**
   * Indicates whether a new message has been received.
   * @type {boolean | undefined}
   */
  public newMessage: boolean | undefined = false;
  /**
   * Indicates whether a new notification has been received.
   * @type {boolean | undefined}
   */
  public newNotification: boolean | undefined;

  /**
 * Observable that emits the authentication status of the user.
 * @returns {Observable<boolean>} - The Observable that emits the authentication status of the user.
 */
  isAuthenticated$ = this._isAuthenticated.asObservable();


  constructor(private _zone: NgZone, private http: HttpClient, private push: Push, private router: Router) { }

  /**
 * Connects to the server-sent events.
 * @param {string} call - The call to connect from.
 */
  sseConnect(call: string) {
    console.log("Getting called from " + call)
    if (this.eventSource == undefined) {
      this.eventSource = this.getEventSource("http://127.0.0.1:8080/api/common-auth/stream")
      this.getServerSentEvent("http://127.0.0.1:8080/api/common-auth/stream").subscribe((data: any) => console.log(data));
    } else {
      console.log(this.eventSource)
      if (this.eventSource.readyState != 1) {
        this.getServerSentEvent("http://127.0.0.1:8080/api/common-auth/stream").subscribe((data: any) => console.log(data));
      }
    }
  }

  /**
   * Retrieves the event source for server-sent events.
   * @param {string} url - The URL to retrieve the event source from.
   * @returns {EventSource} - The event source for server-sent events.
   */
  getEventSource(url: string): EventSource {
    return new EventSource(url, { withCredentials: true });
  }

  /**
   * Emits a message received event.
   * @type {EventEmitter<any>}
   */
  messageReceived: EventEmitter<any> = new EventEmitter();

  /**
   * Retrieves the server-sent events.
   * @param {string} url - The URL to retrieve the server-sent events from.
   * @returns {Observable<any>} - The Observable that emits the server-sent events.
   */
  getServerSentEvent(url: string) {
    return Observable.create((observer: { next: (arg0: MessageEvent<any>) => void; error: (arg0: Event) => void; }) => {
      this.eventSource.onmessage = (event: MessageEvent<any>) => {
        this._zone.run(() => {
          const jsonObject = JSON.parse(event.data);
          const type = jsonObject.Type;
          if (type == "New Message") {
            this.messageReceived.emit(event.data);
            if (this.newMessage == false) {
              this.newMessage = true
            }
          } else if (type == "New Project") {
            this.newNotification = true
            this.presentToast("Μία νέα εργασία είναι διαθέσιμη για εσάς. Δώστε την προσφορά σας!", "primary")
          } else if (type == "Proposal Accepted") {
            this.newNotification = true
            this.presentToast("Μία προσφορά σας έγινε αποδεκτή! Δείτε λεπτομέρειες στις ειδοποιήσεις.", "success")
          }
          observer.next(event);
        });
      };
      this.eventSource.onerror = (error: Event) => {
        console.log(error)
        this._zone.run(() => {
          observer.error(error);
        });
        console.log('SSE error:', error);
        if (this.eventSource.readyState === EventSource.CLOSED) {
          console.log('SSE connection closed, reconnecting...');
          console.log('Trying...');
          setTimeout(() => {
            this.eventSource = this.getEventSource("http://127.0.0.1:8080/api/common-auth/stream")
            this.getServerSentEvent("http://127.0.0.1:8080/api/common-auth/stream").subscribe((data: any) => console.log(data));
          }, 5000);
        }
      };
    })
  }

  /**
   * Presents a toast notification.
   * @param {string} msg - The message to display in the toast notification.
   * @param {string} color - The color of the toast notification.
   */
  async presentToast(msg: string, color: string) {
    const newToastNotification = new ToastNotificationInitializer();
    newToastNotification.setTitle('Ενημέρωση');
    newToastNotification.setMessage(msg);
    let layoutType;
    switch (color.toLowerCase()) {
      case 'success':
        layoutType = DialogLayoutDisplay.SUCCESS;
        break;
      case 'danger':
        layoutType = DialogLayoutDisplay.DANGER;
        break;
      case 'info':
        layoutType = DialogLayoutDisplay.INFO;
        break;
      case 'warning':
        layoutType = DialogLayoutDisplay.WARNING;
        break;
      default:
        layoutType = DialogLayoutDisplay.NONE;
    }
    newToastNotification.setConfig({
      autoCloseDelay: 5000,
      textPosition: 'left',
      layoutType: layoutType,
      progressBar: ToastProgressBarEnum.NONE,
      toastUserViewType: ToastUserViewTypeEnum.STANDARD,
      animationIn: AppearanceAnimation.BOUNCE_IN,
      animationOut: DisappearanceAnimation.BOUNCE_OUT,
      toastPosition: ToastPositionEnum.TOP_RIGHT,
    });
    newToastNotification.openToastNotification$();
  }


  /**
   * Unified error handler
   * @param error Error object
   * @returns Observable of never
   */
  private handleError(error: any): Observable<never> {
    if (error.status === 403) {
      window.location.href = '/login';
      localStorage.setItem('authenticated', "false");
      this._isAuthenticated.next(false);
    }
    console.error('API Error:', error); // Logging the error
    return throwError(error);
  }

  /**
   * Get HTTP headers
   * @returns HTTP headers
   */
  private getHeaders(): HttpHeaders {
    return new HttpHeaders({ 'Content-Type': this.CONTENT_TYPE });
  }

  /**
* Returns the top clients
* @returns An observable that emits the response data from the API
*/
  getTopClients(): Observable<any> {
    return this.http.get(beautyAuthenticated_API_URL + "get-top-clients", { headers: this.getHeaders(), withCredentials: true }).pipe(
      catchError(this.handleError)
    );

  }

  /**
     * Gets the number of pending appointments.
     * @returns An Observable that resolves with the server response.
     */
  getPendingAppointmentsNumber(): Observable<any> {
    return this.http.get(beautyAuthenticated_API_URL + "find-pending-appointments-number", { headers: this.getHeaders(), withCredentials: true }).pipe(
      catchError(this.handleError)
    );
  }

  /**
     * Gets appointments based on status, page, and mode.
     * @param apointmentStatus The status of the appointments to get.
     * @param page The page number of the appointments to get.
     * @param mode The mode of the appointments to get.
     * @param checked_in Whether to filter by checked-in status.
     * @returns An Observable that resolves with the server response.
     */
  getAppointments(apointmentStatus: string, page: number, mode: string, checked_in?: boolean): Observable<any> {
    // Building the base URL
    let apiUrl = `${beautyAuthenticated_API_URL}get-appointments?appointmentStatus=${apointmentStatus}&page=${page}&mode=${mode}`;
    // Appending the checked_in parameter if it's provided
    if (checked_in !== undefined) {
      apiUrl += `&checked_in=${checked_in}`;
    }
    return this.http.get(apiUrl, { headers: this.getHeaders(), withCredentials: true }).pipe(
      catchError(this.handleError)
    );
  }


  /**
   * Gets the navigation data.
   * @returns The navigation data.
   */
  getNavData() {
    if (this.navData == null)
      return 0
    return this.navData;
  }

  /**
  * Accepts an appointment with the given ID
  * @param appointmentId The ID of the appointment to accept
  * @returns An observable that emits the response data from the API
  */
  acceptAppointment(appointmentId: string): Observable<any> {
    const body = { appointmentId: appointmentId };
    return this.http.post(beautyAuthenticated_API_URL + "accept-appointment", body, { headers: this.getHeaders(), withCredentials: true }).pipe(
      catchError(this.handleError)
    );
  }


  /**
   * Changes the check-in status of the Krathsh with the given ID and status
   * @param id The ID of the Krathsh to change the check-in status for
   * @param status The new check-in status for the Krathsh
   * @returns An observable that emits the response data from the API
   */
  changeCheckInStatus(id: string, status: string): Observable<any> {
    const body = {
      krathsh_id: id,
      status: status
    };
    return this.http.post(beautyAuthenticated_API_URL + "check-in-status", body, { headers: this.getHeaders(), withCredentials: true }).pipe(
      catchError(this.handleError)
    );
  }


  /**
   * Rejects an appointment with the given ID and cancel reason
   * @param appointmentId The ID of the appointment to reject
   * @param cancelReason The reason for rejecting the appointment
   * @returns An observable that emits the response data from the API
   */
  rejectAppointment(appointmentId: string, cancelReason: string): Observable<any> {
    const body = { appointmentId: appointmentId, cancelReason: cancelReason };
    return this.http.post(beautyAuthenticated_API_URL + "reject-appointment", body, { headers: this.getHeaders(), withCredentials: true }).pipe(
      catchError(this.handleError)
    );
  }

  /**
  * Returns the statistics numbers for a given time frame
  * @param timeFrame The time frame for which to retrieve statistics numbers
  * @returns An observable that emits the response data from the API
  */
  getStatsNumber(timeFrame: string): Observable<any> {
    return this.http.get(beautyAuthenticated_API_URL + "get-stats-numbers?timeFrame=" + timeFrame, { headers: this.getHeaders(), withCredentials: true }).pipe(
      catchError(this.handleError)
    );
  }


  /**
   * Returns the statistics for a given time frame
   * @param timeFrame The time frame for which to retrieve statistics
   * @returns An observable that emits the response data from the API
   */
  getStats(timeFrame: string): Observable<any> {
    return this.http.get(beautyAuthenticated_API_URL + "get-stats?timeFrame=" + timeFrame, { headers: this.getHeaders(), withCredentials: true }).pipe(
      catchError(this.handleError)
    );
  }


  /**
   * Checks for new notifications.
   * @returns An Observable that resolves with the server response.
   */
  checkForNotifications() {
    return this.http.get<any>(Authenticated_API_URL + 'check-notifications', { withCredentials: true }).pipe(map(response => {
      if (response) {
        console.log(response)
      }
      return response;
    }));
  }

  /**
   * Logs in with OAuth.
   * @param token The OAuth token.
   * @param oauth The OAuth provider.
   * @returns An Observable that resolves with the server response.
   */
  loginOAuth(token: string, oauth: string): Observable<any> {
    return this.http.post<any>(API_URL + 'login-oauth?oauth=' + oauth, token, { withCredentials: true }).pipe(map(response => {
      if (response) {
        localStorage.setItem('authenticated', 'true');
        this._isAuthenticated.next(true);
        this.pushSetup(response.token)
        window.location.href = '/tabs/home'
      }
      return response;
    }));
  }

  /**
 * Sets up push notifications.
 * @param {string} jwt - The JWT token.
 */
  pushSetup(jwt: string) {
    const options: PushOptions = {
      android: {
        senderID: '540023271547'
      },
      ios: {
        alert: 'true',
        badge: true,
        sound: 'false'
      }
    };
    const pushObject: PushObject = this.push.init(options);
    pushObject.on('registration').subscribe((registration: any) => {
      console.log('Device registered', registration.registrationId)
      this.registerToken(registration.registrationId, jwt)
    });
    pushObject.on('error').subscribe(error => console.error('Error with Push plugin', error));
  }

  /**
   * Registers the token.
   * @param {String} token - The token to register.
   * @param {String} jwt - The JWT token.
   * @returns {Promise<any>} - A Promise that resolves when the token has been registered.
   */
  registerToken(token: String, jwt: String): Promise<any> {
    return this.http.get("http://10.0.2.2:8080/api/auth/register-token?token=" + token, { headers: this.getHeaders(), withCredentials: true }).toPromise()
  }


  /**
   * Requests an OTP.
   * @param {string} email - The email to request the OTP for.
   * @returns {Observable<any>} - The Observable that emits the OTP request response.
   */
  requestOTP(email: string): Observable<any> {
    console.log(email);
    return this.http.get<any>(API_URL + 'request-otp?email=' + email).pipe(map(response => {
      if (response) {
        console.log(response)
      }
      return response;
    }));
  }

  /**
   * Sets the navigation data.
   * @param navObj The navigation object to set.
   */
  setNavData(navObj: any) {
    this.navData = navObj;
  }

  /**
 * Logs in the user.
 * @param {User} user - The user to log in.
 * @returns {Observable<any>} - The Observable that emits the login response.
 */
  login(user: User): Observable<any> {
    let to_send = btoa(user.username + ':' + user.password)
    let username = btoa(user.username)
    let password = btoa(user.password)
    localStorage.clear();
    const params = new HttpParams().append('username', username).append('password', password);
    return this.http.post<any>(API_URL + 'login', params, { withCredentials: true }).pipe(
      tap(response => {
        if (response && response.statusCode === 200) {
          console.log("MPIKA");
          localStorage.setItem('authenticated', "true");
          this._isAuthenticated.next(true);
          this.pushSetup(response.token);
          window.location.href = '/tabs/home';
        } else if (response && response.statusCode === 409) {
          console.log("LOG")
          window.location.href = '/onboarding';
          this.pushSetup(response.token);
        }
      }),
      map(response => {
        return response;
      })
    );
  }

  /**
   * Registers a new user with OAuth.
   * @param user The user to register.
   * @param oauth The OAuth provider.
   * @returns An Observable that resolves with the server response.
   */
  registerOAuth(user: User, oauth: string): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.post(API_URL + 'registration-oauth?oauth=' + oauth, JSON.stringify(user), { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        if (error.status === 403) {
          localStorage.setItem('authenticated', "false");
          window.location.href = '/login';
        }
        return throwError(error);
      })
    );
  }

  /**
  * Registers a new user.
  * @param user The user to register.
  * @returns An Observable that resolves with the server response.
  */
  register(user: User): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.post(API_URL + 'registration', JSON.stringify(user), { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        if (error.status === 403) {
          localStorage.setItem('authenticated', "false");
          window.location.href = '/login';
        }
        return throwError(error);
      })
    );
  }

  /**
  * Sets a new password.
  * @param password The new password.
  * @param repeated_password The repeated new password.
  * @param token The token for the password change.
  * @returns An Observable that resolves with the server response.
  */
  setNewPassword(password: string, repeated_password: string, token: string): Observable<any> {
    const params = new HttpParams().append('password', password).append('repeated_password', repeated_password).append('token', token);
    if (token == "") {
      return of(null);
    } else {
      try {
        return this.http.post<any>(API_URL + 'change-password', params).pipe(map(response => {
          if (response) {
            console.log(response)
          }
          return response;
        }));
      } catch (error) {
        console.log('Error Status: ', error);
        this.router.navigate(['/tablinks/login']);
        return of(null);
      }
    }
  }

  /**
  * Sends an OTP for verification.
  * @param email The email to send the OTP to.
  * @param otp The OTP to send.
  * @returns An Observable that resolves with the server response.
  */
  sendOTP(email: string, otp: string): Observable<any> {
    const params = new HttpParams().append('OTP', otp).append('email', email);
    return this.http.post<any>(API_URL + 'verify-otp', params).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Sends a password reset email.
   * @param email The email to send the reset to.
   * @returns A Promise that resolves with the server response.
   */
  forgotPassword(email: String): Promise<any> {
    return this.http.post(API_URL + "forgot-password", email).toPromise();
  }


  /**
   * Sends onboarding data to the server.
   * @param name The name of the expert.
   * @param categories The categories the expert belongs to.
   * @param address The address of the expert.
   * @param photo The expert's photo.
   * @param days The expert's work days.
   * @param floors The expert's floors.
   * @returns An Observable that resolves to the server response.
   */
  onBoarding(name: string, expertCategories: string, address: string, photo: string | undefined, days: any[], people: any[], services: any[],servicesCategories:any[]): Observable<any> {
    const data = {
      name: name,
      expertCategories: expertCategories,
      address: address,
      photo: photo?.split(",")[1],
      expertWP: days,
      people: people,
      services: services,
      servicesCategories:servicesCategories
    };
    console.log(data)
    return this.http.post(beautyAuthenticated_API_URL + "onboarding", data, { headers: this.getHeaders(), withCredentials: true }).pipe(
      catchError((error) => {

        return throwError(error);
      })

    );
  }

  /**
   * Returns the expert slug.
   * @returns An Observable that resolves to the expert slug.
   */
  getExpertSlug(): Observable<any> {
    return this.http.get(beautyAuthenticated_API_URL + "get-expert-slug", { withCredentials: true }).pipe(
      catchError(this.handleError)
    );
  }

  /**
  * Returns the expert data.
  * @returns An Observable that resolves to the expert data.
  */
  getExpertData(): Observable<any> {
    return this.http.get(Authenticated_API_URL + "get-expert-data", { headers: this.getHeaders(), withCredentials: true }).pipe(
      catchError(this.handleError)
    );;
  }

  /**
 * Check if the device is mobile
 * @returns True if the device is mobile, false otherwise
 */
  isMobile(): boolean {
    return window.innerWidth <= 992;
  }

  /**
    * Logs out the user.
    * @returns An Observable that resolves to the server response.
    */
  logout(): Observable<any> {
    localStorage.clear();
    return this.http.post(Authenticated_API_URL + "logout", "", { headers: this.getHeaders(), withCredentials: true }).pipe(
      tap(() => {
        // If the request is successful, redirect to login page
        window.location.href = '/login';
      }),
      catchError(this.handleError)
    );
  }


  /**
   * Guesses addresses based on user input.
   * @param input The user input to guess addresses from.
   * @returns An Observable that resolves with the server response.
   */
  guessAddresses(input: string) {
    return this.http.get<any>(API_URL + 'guess-addresses?filter=' + input, { withCredentials: true }).pipe(map(response => {
      if (response) {
        console.log(response)
      }
      return response;
    }));
  }

  /**
  * Returns the messages.
  * @param id The message ID.
  * @param page The page number.
  * @returns An Observable that resolves to the messages.
  */
  getMessages(id: any, page: number): Observable<any> {
    return this.http.get(Authenticated_API_URL + "get-messages?userId=" + id + "&page=" + page, { headers: this.getHeaders(), withCredentials: true }).pipe(
      catchError(this.handleError)
    );;
  }

  /**
   * Sends a message to the server.
   * @param message The message to send.
   * @returns An Observable that resolves to the server response.
   */
  sendMessage(message: Message): Observable<any> {
    return this.http.post(Authenticated_API_URL + "send-message", message, { headers: this.getHeaders(), withCredentials: true }).pipe(
      catchError(this.handleError)
    );;
  }


  /**
 * Returns whether there are message notifications.
 * @returns An Observable that resolves to whether there are message notifications.
 */
  gotMessageNotifications(): Observable<any> {
    return this.http.get(Authenticated_API_URL + "got-message-notifications", { headers: this.getHeaders(), withCredentials: true });
  }

  /**
   * Returns the chats.
   * @returns An Observable that resolves to the chats.
   */
  getChats(): Observable<any> {
    return this.http.get(Authenticated_API_URL + "get-chats", { headers: this.getHeaders(), withCredentials: true }).pipe(
      catchError(this.handleError)
    );;
  }

  /**
   * Returns the user name.
   * @param id The user ID.
   * @returns An Observable that resolves to the user name.
   */
  getUserName(id: string): Observable<any> {
    return this.http.get(Authenticated_API_URL + "get-user-name?userId=" + id, { withCredentials: true }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Returns the user image.
   * @param id The user ID.
   * @returns An Observable that resolves to the user image.
   */
  getUserImage(id: string): Observable<any> {
    return this.http.get(Authenticated_API_URL + "get-user-profile-image?userId=" + id, { withCredentials: true }).pipe(
      catchError(this.handleError)
    );
  }


  /**
   * Returns the last message.
   * @param id The message ID.
   * @returns An Observable that resolves to the last message.
   */
  getLastMessage(id: any): Observable<any> {
    return this.http.get(Authenticated_API_URL + "get-last-message?id=" + id, { headers: this.getHeaders(), withCredentials: true });
  }



  /**
   * Saves the expert data.
   * @param expertData The expert data to save.
   * @returns An Observable that resolves to the server response.
   */
  saveExpertData(expertData: expertData): Observable<any> {
    return this.http.post(Authenticated_API_URL + "save-expert-data", expertData, { headers: this.getHeaders(), withCredentials: true }).pipe(
      catchError(this.handleError)
    );;
  }


  /**
   * Returns the expert image.
   * @returns An Observable that resolves to the expert image.
   */
  getExpertImage(): Observable<any> {
    return this.http.get(Authenticated_API_URL + "get-expert-profile-image", { withCredentials: true }).pipe(
      catchError(this.handleError)
    );
  }

  /**
 * Returns the portfolio.
 * @returns An Observable that resolves to the portfolio.
 */
  getPortfolio(): Observable<any> {
    return this.http.get(Authenticated_API_URL + "get-portfolio-folders", { headers: this.getHeaders(), withCredentials: true }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Creates a new portfolio folder.
   * @param name The name of the new folder.
   * @param image The image of the new folder.
   * @returns An Observable that resolves to the server response.
   */
  newPorfolioFolder(name: string, image: string): Observable<any> {
    const body = { displayed_name: name, image: image };
    return this.http.post(Authenticated_API_URL + "new-portfolio-folder", body, { headers: this.getHeaders(), withCredentials: true }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Changes a portfolio folder.
   * @param id The ID of the folder to change.
   * @param name The new name of the folder.
   * @param image The new image of the folder.
   * @param new_image True if the image has changed, false otherwise.
   * @returns An Observable that resolves to the server response.
   */
  changePortfolioFolder(id: string, name: string, image: string, new_image: string): Observable<any> {
    const body = { folder_id: id, displayed_name: name, image: image, new_image: new_image };
    return this.http.post(Authenticated_API_URL + "change-portfolio-folder", body, { headers: this.getHeaders(), withCredentials: true }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Deletes a portfolio folder.
   * @param folder_id The ID of the folder to delete.
   * @returns An Observable that resolves to the server response.
   */
  deletePortfolioFolder(folder_id: string): Observable<any> {
    const body = { folder_id: folder_id };
    return this.http.post(Authenticated_API_URL + "delete-portfolio-folder", body, { headers: this.getHeaders(), withCredentials: true }).pipe(
      catchError(this.handleError)
    );
  }



  /**
   * Get folder name
   * @param id Folder ID
   * @returns Observable of the folder name
   */
  getFolderName(id: string): Observable<any> {
    return this.http.get(Authenticated_API_URL + "get-portfolio-folder-name?id=" + id, { headers: this.getHeaders(), withCredentials: true }).pipe(
      catchError(this.handleError)
    );
  }


  /**
   * Deletes an image from a portfolio folder.
   * @param folder_id The ID of the folder containing the image.
   * @param image_id The ID of the image to delete.
   * @returns An Observable that resolves with the server response.
   */
  deleteImagePortfolio(folder_id: string, image_id: string): Observable<any> {
    const body = { folder_id: folder_id, image_id: image_id };
    return this.http.post(Authenticated_API_URL + "delete-image-portfolio", body, { headers: this.getHeaders(), withCredentials: true }).pipe(
      catchError(this.handleError)
    );
  }


  /**
   * Returns the images of a portfolio folder.
   * @param folder_id The ID of the folder.
   * @returns An Observable that resolves to the images of the portfolio folder.
   */
  getPortfolioFolderImages(folder_id: string): Observable<any> {
    return this.http.get(Authenticated_API_URL + "portfolio-images-links?folder_id=" + folder_id, { headers: this.getHeaders(), withCredentials: true }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Adds new photos to a folder.
   * @param images An array of Base64-encoded image strings.
   * @param folderId The ID of the folder to add the photos to.
   * @returns An Observable that resolves with the server response.
   */
  addNewPhotos(images: string[], folderId: string): Observable<any> {
    const body = {
      images: images,
      folderId: folderId
    };
    return this.http.post(Authenticated_API_URL + "new-photos", body, { headers: this.getHeaders(), withCredentials: true }).pipe(
      catchError(this.handleError)
    );
  }

  /**
 * Gets an Instagram access token from an authorization code.
 * @param code The authorization code to exchange for an access token.
 * @returns An Observable that resolves with the server response.
 */
  getInstagramTokenFromCode(code: string): Observable<any> {
    return this.http.get(Authenticated_API_URL + "instagram-token?code=" + code, { withCredentials: true }).pipe(
      catchError(this.handleError)
    );
  }

  /**
* Filters the clients.
* @param filter The filter to apply.
* @returns An Observable that resolves to the filtered clients.
*/
  filterClients(filter: string): Observable<any> {
    return this.http.get(Authenticated_API_URL + "filter-clients?filter=" + filter, { headers: this.getHeaders(), withCredentials: true }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Returns all clients.
   * @param page The page number.
   * @returns An Observable that resolves to all clients.
   */
  getAllClients(page: number): Observable<any> {
    return this.http.get(Authenticated_API_URL + "get-all-clients?page=" + page, { headers: this.getHeaders(), withCredentials: true }).pipe(
      catchError(this.handleError)
    );
  }


  /**
   * Returns the expert reviews.
   * @param page The page number.
   * @returns An Observable that resolves to the expert reviews.
   */
  getExpertReviews(page: number): Observable<any> {
    return this.http.get(Authenticated_API_URL + "get-reviews?page=" + page, { headers: this.getHeaders(), withCredentials: true }).pipe(
      catchError(this.handleError)
    );;
  }

  /**
   * Returns the expert reviews data.
   * @returns An Observable that resolves to the expert reviews data.
   */
  getExpertReviewsData(): Observable<any> {
    return this.http.get(Authenticated_API_URL + "get-expert-reviews-data", { headers: this.getHeaders(), withCredentials: true }).pipe(
      catchError(this.handleError)
    );
  }


  /**
   * Sends a response to a review.
   * @param answer The response to send.
   * @param reviewId The review ID.
   * @returns An Observable that resolves to the server response.
   */
  sendResponseToReview(answer: string, reviewId: string): Observable<any> {
    const body = { answer: answer, reviewId: reviewId };
    return this.http.post(Authenticated_API_URL + "send-review-answer", body, { headers: this.getHeaders(), withCredentials: true }).pipe(
      catchError(this.handleError)
    );
  }


  /**
   * Get working hours
   * @returns Observable of working hours
   */
  getWrario(): Observable<any> {
    return this.http.get(beautyAuthenticated_API_URL + "get-wrario", { headers: this.getHeaders(), withCredentials: true }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Save working hours
   * @param days Working hours to save
   * @returns Observable of the response
   */
  saveWrario(days: any[]): Observable<any> {
    const data = {
      expertWP: days
    };
    return this.http.post(beautyAuthenticated_API_URL + "save-wrario", days, { headers: this.getHeaders(), withCredentials: true }).pipe(
      catchError(this.handleError)
    );
  }


  /**
   * Get schedule exceptions
   * @returns Observable of schedule exceptions
   */
  getScheduleExceptions(): Observable<any> {
    return this.http.get(beautyAuthenticated_API_URL + "get-schedule-exceptions", { headers: this.getHeaders(), withCredentials: true }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Add a schedule exception
   * @param startDateTime Start date and time of the exception
   * @param endDateTime End date and time of the exception
   * @returns Observable of the response
   */
  addScheduleException(startDateTime: string, endDateTime: string): Observable<any> {
    const body = {
      startDateTime: startDateTime,
      endDateTime: endDateTime
    };
    return this.http.post(beautyAuthenticated_API_URL + "add-schedule-exception", body, { headers: this.getHeaders(), withCredentials: true }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Save schedule exceptions
   * @param scheduleExceptions Schedule exceptions to save
   * @returns Observable of the response
   */
  saveScheduleExceptions(scheduleExceptions: any): Observable<any> {
    const body = {
      exceptions: scheduleExceptions,
    };
    return this.http.post(beautyAuthenticated_API_URL + "save-schedule-exceptions", body, { headers: this.getHeaders(), withCredentials: true }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Returns the Krathseis settings
   * @returns An observable that emits the response data from the API
   */
  getAppointmentsSettings(): Observable<any> {
    return this.http.get(beautyAuthenticated_API_URL + "get-appointments-settings", { headers: this.getHeaders(), withCredentials: true }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Saves the Krathseis settings
   * @param maxReservationMinutes The maximum number of minutes for a reservation
   * @param slotInterval The time interval for slots
   * @param needAccept Whether reservations need to be accepted
   * @param isVisible Whether the Krathseis is visible for reservations
   * @returns An observable that emits the response data from the API
   */
  saveAppointmentsSettings(
    maxReservationMinutes: number,
    slotInterval: string,
    needAccept: boolean,
    isVisible: boolean
  ): Observable<any> {
    const body = {
      maxReservationMinutes: maxReservationMinutes.toString(),
      time_interval: slotInterval.toString(),
      reservations_auto_accept: needAccept ? "true" : "false",
      is_visible_for_reservations: isVisible ? "true" : "false"
    };
    return this.http.post(
      beautyAuthenticated_API_URL + "save-appointments-settings",
      body,
      { headers: this.getHeaders(), withCredentials: true }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
* Changes the password of an authenticated user.
* @param old_password The old password of the user.
* @param password The new password of the user.
* @param repeated_password The new password of the user repeated for confirmation.
* 
*/
  setNewPasswordAuthenticated(old_password: string, password: string, repeated_password: string): Observable<any> {
    const body = { old_password: old_password, password: password, repeated_password: repeated_password };
    return this.http.post<any>(Authenticated_API_URL + 'change-password-authenticated', body, { headers: this.getHeaders(), withCredentials: true }).pipe(
      catchError(this.handleError)
    );
  }

  /**
    * Returns the notifications.
    * @param page The page number.
    * @returns An Observable that resolves to the notifications.
    */
  getNotifications(page: number): Observable<any> {
    return this.http.get(Authenticated_API_URL + "get-notifications?page=" + page, { headers: this.getHeaders(), withCredentials: true }).pipe(
      catchError(this.handleError)
    );
  }


  /**
    * Searches for a client with the given filter
    * @param filter The filter to search for
    * @returns An observable that emits the response data from the API
    */
  searchClient(filter: string): Observable<any> {
    return this.http.get(Authenticated_API_URL + "search-client?filter=" + filter, { headers: this.getHeaders(), withCredentials: true }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Creates a new client with the given name, surname and phone
   * @param name The name of the new client
   * @param surname The surname of the new client
   * @param phone The phone number of the new client
   * @returns An observable that emits the response data from the API
   */
  newManualClient(name: string, surname: string, phone: string): Observable<any> {
    const body = { name: name, surname: surname, phone: phone };
    return this.http.post(Authenticated_API_URL + "new-manual-client", body, { headers: this.getHeaders(), withCredentials: true }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Edits a manual client.
   * @param client_id The ID of the client to edit.
   * @param name The new name of the client.
   * @param phone The new phone number of the client.
   * @returns An Observable that resolves with the server response.
   */
  editManualClient(client_id: string, name: string, phone: string): Observable<any> {
    // Body for the post request based on your endpoint's expected data structure
    const body = {
      "client_id": client_id,
      "name": name,
      "phone": phone
    };
    return this.http.post(Authenticated_API_URL + "edit-manual-client", body, { headers: this.getHeaders(), withCredentials: true }).pipe(
      catchError(this.handleError)
    );
  }

 
  getAvailableTimeBooking(date: string, servicesEmployeesMap: { [key: string]: string }): Observable<any> {
    // Set the date as a query parameter
    const params = new HttpParams().set('date', date);
    
    // Use the provided servicesEmployeesMap as the body directly
    const body = servicesEmployeesMap;

    return this.http.post(beautyAuthenticated_API_URL + "get-available-slots", body, {
        headers: this.getHeaders(),
        params: params,
        withCredentials: true
    })
    .pipe(
      catchError(this.handleError)
    );
}


 
  newAppointment(servicesEmployees: any, theDate: string, timeSelected: string, selectedClientId: string): Observable<any> {
    const body = {
      servicesEmployees: servicesEmployees,
      bookingDate: theDate,
      timeSelected: timeSelected,
      selectedClientId: selectedClientId
    };

    return this.http.post(beautyAuthenticated_API_URL + "new-appointment", body, { headers: this.getHeaders(), withCredentials: true }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get the number of reservations for a client
   * @param user_id User ID
   * @returns Observable of the number of reservations
   */
  getNumberOfReservationsClient(user_id: string): Observable<any> {
    return this.http.get(beautyAuthenticated_API_URL + "get-number-reservations-client?user_id=" + user_id, { headers: this.getHeaders(), withCredentials: true }).pipe(
      catchError(this.handleError)
    );
  }

   /**
   * Returns the user's reservations for the given page number and user ID
   * @param page The page number to retrieve
   * @param userId The ID of the user to retrieve reservations for
   * @returns An observable that emits the response data from the API
   */
   getUserReservations(page: number, userId: string): Observable<any> {
    return this.http.get(beautyAuthenticated_API_URL + "get-user-appointments?user_id=" + userId + "&page=" + page, { headers: this.getHeaders(), withCredentials: true }).pipe(
      catchError(this.handleError)
    );
  }
  
  /**
 * Retrieves user data by their ID.
 * @param {string} id - The ID of the user to retrieve data for.
 * @returns {Observable<any>} - The Observable that emits the user data.
 */
getUserData(id: string): Observable<any> {
  return this.http.get(Authenticated_API_URL + "get-user-data?user_id=" + id, { headers: this.getHeaders(), withCredentials: true }).pipe(
    catchError(this.handleError)
  );
}
  /**
   * Returns the reviews by user ID.
   * @param id The user ID.
   * @returns An Observable that resolves to the reviews by user ID.
   */
  getReviewsByUserId(id: string): Observable<any> {
    return this.http.get(Authenticated_API_URL + "get-user-reviews?user_id=" + id, { headers: this.getHeaders(), withCredentials: true }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Searches for a Krathsh with the given filter and page number
   * @param filter The filter to search for
   * @param page The page number to retrieve
   * @returns An observable that emits the response data from the API
   */
  searchAppointment(filter: string, page: number): Observable<any> {
    return this.http.get(beautyAuthenticated_API_URL + "search-appointment?filter=" + filter + "&page=" + page, { headers: this.getHeaders(), withCredentials: true }).pipe(
      catchError(this.handleError)
    );
  }

  /**
 * Retrieves an appointment by its ID.
 * @param {number} appointment_id - The ID of the appointment to retrieve.
 * @returns {Observable<any>} - The Observable that emits the appointment data.
 */
getAppointment(appointment_id: number): Observable<any> {
  return this.http.get(beautyAuthenticated_API_URL + "get-appointment?appointment_id=" + appointment_id, { headers: this.getHeaders(), withCredentials: true }).pipe(
    catchError(this.handleError)
  );
}

  
getServiceCategories(): Observable<any> {
    return this.http.get(beautyAuthenticated_API_URL + "get-service-categories", { headers: this.getHeaders(), withCredentials: true }).pipe(
      catchError(this.handleError)
    );
  }

  getServices(category:string): Observable<any> {
    return this.http.get(beautyAuthenticated_API_URL + "get-services?category="+category, { headers: this.getHeaders(), withCredentials: true }).pipe(
      catchError(this.handleError)
    );
  }


 
  getEmployeesOfServices(serviceIds:string): Observable<any> {
    return this.http.get(beautyAuthenticated_API_URL + "get-employees-of-services?serviceIds="+serviceIds, { headers: this.getHeaders(), withCredentials: true }).pipe(
      catchError(this.handleError)
    );
  }

  

  getAvailableDays(month:number,year:number,employeeIds:string): Observable<any> {
    return this.http.get(beautyAuthenticated_API_URL + "get-available-days?employeeIds="+employeeIds+"&month="+month+"&year="+year, { headers: this.getHeaders(), withCredentials: true }).pipe(
      catchError(this.handleError)
    );
  }


}
