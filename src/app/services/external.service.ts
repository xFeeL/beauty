import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, switchMap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ExternalService {

  instagramAuthUrl = 'http://api.instagram.com/oauth/authorize' +
    '?client_id=965486744888103' +
    '&redirect_uri=https://localhost:8101/' +
    '&scope=user_profile,user_media' +
    '&response_type=code';
  constructor(private http: HttpClient) { }

  getFacebookPages(accessToken: any) {
    console.log(accessToken)
    const url = 'https://graph.facebook.com/v16.0/me/accounts?fields=name,picture,instagram_business_account&access_token=' + accessToken.token;
    return this.http.get<any>(url).pipe(map(response => {
      if (response) {
        console.log("mpika2")

        console.log('Got pages', response.data);
        return response;
      }
    }));
  }


  getFacebookPageCTA(accessToken: any, pageId: any) {
    console.log(accessToken)
    const url = 'https://graph.facebook.com/v16.0/' + pageId + '?fields=call_to_actions&access_token=' + accessToken.token
    return this.http.get<any>(url).pipe(map(response => {
      if (response) {
        console.log("mpika2")

        console.log('Got pages', response.data);
        return response;
      }
    }));
  }

  getPhotos(userId: any, accessToken: any) {
    console.log(accessToken)
    const url = 'https://graph.facebook.com/v16.0/' + userId + '/albums?access_token=' + accessToken.token
    return this.http.get<any>(url).pipe(map(response => {
      if (response) {
        console.log("mpika2")

        console.log('Got Photos', response.data);
        return response;
      }
    }));
  }

  getFacebookPagesNameAndImage(accessToken: any) {
    console.log(accessToken)
    const url = 'https://graph.facebook.com/v16.0/me/accounts?access_token=' + accessToken + '&fields=picture,name'
    return this.http.get<any>(url).pipe(map(response => {
      if (response) {


        return response;
      }
    }));
  }

  getFacebookUserNameAndImage(accessToken: any) {
    console.log(accessToken)
    const url = 'https://graph.facebook.com/v16.0/me?access_token=' + accessToken + '&fields=picture,name'
    return this.http.get<any>(url).pipe(map(response => {
      if (response) {


        return response;
      }
    }));
  }

  getPageAccessToken(accessToken: any, pageId: string) {
    const url = 'https://graph.facebook.com/v16.0/' + pageId + '?access_token=' + accessToken + '&fields=access_token'
    return this.http.get<any>(url).pipe(map(response => {
      if (response) {


        return response;
      }
    }));
  }


  getAlbums(accessToken: any, id: string) {
    console.log(accessToken)
    const url = 'https://graph.facebook.com/v16.0/' + id + '/albums?access_token=' + accessToken + '&fields=picture,id,name'
    return this.http.get<any>(url).pipe(map(response => {
      if (response) {


        return response;
      }
    }));
  }

  getFacebookImageLinkFromId(accessToken: any, imageId: any) {
    console.log(accessToken)
    const url = 'https://graph.facebook.com/v16.0/' + imageId + '?fields=images&access_token=' + accessToken
    return this.http.get<any>(url).pipe(map(response => {
      if (response) {


        return response;
      }
    }));
  }

  getFacebookPhotosFromAlbumId(accessToken: any, albumId: any) {
    console.log(accessToken)
    const url = 'https://graph.facebook.com/v16.0/' + albumId + '?fields=photos{images}&access_token=' + accessToken
    return this.http.get<any>(url).pipe(map(response => {
      if (response) {


        return response;
      }
    }));
  }


  getInstagramPhotos(accessToken: any) {
    console.log(accessToken)
    const url = 'https://graph.instagram.com/me/media' + '?fields=children{media_url,media_type},media_url,media_type&access_token=' + accessToken
    return this.http.get<any>(url).pipe(map(response => {
      if (response) {


        return response;
      }
    }));
  }


  getInstagramUser(accessToken: any) {
    console.log(accessToken)
    const url = 'https://graph.instagram.com/me?fields=id,username&access_token=' + accessToken
    return this.http.get<any>(url).pipe(map(response => {
      if (response) {


        return response;
      }
    }));
  }

  updatePersistentMenuAndGetStarted(pageAccessToken: string, pageId: string, menuItems: any[], getStartedPayload: string, platform: string) {
    let url = "";
    if (platform == "facebook") {
      url = `https://graph.facebook.com/v16.0/${pageId}/messenger_profile`;
    } else {
      url = `https://graph.facebook.com/v16.0/${pageId}/messenger_profile?platform=instagram`;
    }

    const setPersistentMenu = () => {
      // Set Persistent Menu
      const persistentMenuBody = {
        access_token: pageAccessToken,
        persistent_menu: [
          {
            locale: 'default',
            call_to_actions: menuItems,
          },
        ],
      };
      return this.http.post<any>(url, persistentMenuBody).pipe(
        map(menuResponse => {
          if (menuResponse) {
            return menuResponse;
          } else {
            throw new Error('Persistent Menu Update failed');
          }
        }),
        catchError(error => {
          console.error('There was an error during the persistent menu update', error);
          return throwError(error);
        })
      );
    }

    if (platform === "instagram") {
      return setPersistentMenu();
    } else {
      // Set Get Started button for Facebook
      const getStartedBody = {
        access_token: pageAccessToken,
        get_started: {
          payload: getStartedPayload,
        },
      };

      return this.http.post<any>(url, getStartedBody).pipe(
        switchMap(response => {
          if (response) {
            console.log('Get Started button set successfully');
            return setPersistentMenu();
          } else {
            throw new Error('Get Started button set failed');
          }
        }),
        catchError(error => {
          console.error('There was an error during the Get Started button update', error);
          return throwError(error);
        })
      );
    }
  }

  updatePageAboutAndWebsite(pageAccessToken: string, pageId: string, newAboutText: string, newWebsite: string) {
    const url = `https://graph.facebook.com/v16.0/${pageId}`;
    const body = {
      access_token: pageAccessToken,
      about: newAboutText,
      website: newWebsite, // Add website field to update website
    };
    return this.http.post<any>(url, body).pipe(map(response => {
      if (response) {
        return response;
      } else {
        throw new Error('Update failed');
      }
    }), catchError(error => {
      console.error('There was an error during the update', error);
      return throwError(error);
    }));
  }


  getPersistentMenuMessenger(pageAccessToken: any, pageId: string, platform: string) {
    let url = ""
    if (platform == "facebook") {
      url = 'https://graph.facebook.com/v16.0/' + pageId + '/messenger_profile?access_token=' + pageAccessToken + '&fields=persistent_menu'

    } else {
      url = 'https://graph.facebook.com/v16.0/' + pageId + '/messenger_profile?access_token=' + pageAccessToken + '&fields=persistent_menu&platform=instagram'

    }
    return this.http.get<any>(url).pipe(map(response => {
      if (response) {
        return response;
      }
    }));
  }

  getPageCTAandAbout(pageAccessToken: any, pageId: string) {
    const url = 'https://graph.facebook.com/v16.0/' + pageId + '?access_token=' + pageAccessToken + '&fields=call_to_actions{type,status,created_time},about'
    return this.http.get<any>(url).pipe(map(response => {
      if (response) {
        return response;
      }
    }));
  }

  getInstagramPersistentMenu(accessToken: any) {
    const url = 'https://graph.facebook.com/v11.0/me/messenger_profile?fields=persistent_menu&platform=instagram&access_token=' + accessToken;
    return this.http.get<any>(url).pipe(
      map(response => {
        if (response && response.persistent_menu) {
          return response.persistent_menu;
        }
      })
    );
  }
}
