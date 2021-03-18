import { Component } from '@angular/core';
import * as firebase from 'firebase';

const config = {
  apiKey: 'AIzaSyAxgGYRkC9ygORZDEiyW7jdIc9UFhrLig8',
  databaseURL: 'https://sample-chat-ef2ad-default-rtdb.firebaseio.com/'
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'angular-chat';

  constructor() {
    firebase.initializeApp(config);
  }
}
