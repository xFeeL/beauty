import { Component } from '@angular/core';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {

  constructor(private userService:UserService) {}

  ionViewWillEnter(){
    this.newMessage()
    //this.userService.getServerSentEvent("http://127.0.0.1:8080/api/expert-auth/stream").subscribe((data: any) => console.log(data));

    
    this.userService.checkForNotifications().subscribe(data => {
      if(data[0]==1){
        this.userService.newMessage=true;
      }else if(data[1]==1){
        this.userService.newNotification=true;

      }else if(data[0]==0){
        this.userService.newMessage=false

      }
    
  })}
  public newMessage() {
  
    return this.userService.newMessage;
}

public newNotification() {
  return this.userService.newNotification;
}
}
