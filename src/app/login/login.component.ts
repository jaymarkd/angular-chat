import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroupDirective, FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import * as firebase from 'firebase';
import { DatePipe } from '@angular/common';

export const snapshotToArray = (snapshot: any) => {
  const returnArr = [];

  snapshot.forEach((childSnapshot: any) => {
      const item = childSnapshot.val();
      item.key = childSnapshot.key;
      returnArr.push(item);
  });

  return returnArr;
};
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  nickname = '';
  ref = firebase.database().ref('users/');
  matcher = new MyErrorStateMatcher();

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    public datepipe: DatePipe) { }

  ngOnInit() {
    this.createInitRoom();
    if (localStorage.getItem('nickname')) {
      this.nickname =localStorage.getItem('nickname');
      this.enterChatRoom("chatroom");
    }
    this.loginForm = this.formBuilder.group({
      'nickname' : [null, Validators.required]
    });
  }
  createInitRoom() {
    const room = { roomname: "chatroom" };
    this.ref.orderByChild('roomname')
    .equalTo(room.roomname).once('value', (snapshot: any) => {

      if (!snapshot.exists()) {
        const newRoom = firebase.database().ref('rooms/').push();
        newRoom.set(room);
      }

    });
  }

  onFormSubmit(form: any) {
    const login = form;
    this.ref.orderByChild('nickname')
    .equalTo(login.nickname).once('value', snapshot => {

      if (snapshot.exists()) {

        localStorage.setItem('nickname', login.nickname);
        this.enterChatRoom("chatroom");

      } else {

        const newUser = firebase.database().ref('users/').push();
        newUser.set(login);
        localStorage.setItem('nickname', login.nickname);
        this.nickname =login.nickname;
        this.enterChatRoom("chatroom");

      }

    });
  }

  enterChatRoom(roomname: string) {

    const chat = { roomname: '', nickname: '', message: '', date: '', type: '' };
    chat.roomname = roomname;
    chat.nickname = this.nickname;
    chat.date = this.datepipe.transform(new Date(), 'dd/MM/yyyy HH:mm:ss');
    chat.message = `${this.nickname} enter the room`;
    chat.type = 'join';
    const newMessage = firebase.database().ref('chats/').push();
    newMessage.set(chat);

    firebase.database().ref('roomusers/').orderByChild('roomname')
    .equalTo(roomname).on('value', (resp: any) => {

      let roomuser = [];
      roomuser = snapshotToArray(resp);
      const user = roomuser.find(x => x.nickname === this.nickname);

      if (user !== undefined) {

        const userRef = firebase.database().ref('roomusers/' + user.key);
        userRef.update({status: 'online'});

      } else {

        const newroomuser = { roomname: '', nickname: '', status: '' };
        newroomuser.roomname = roomname;
        newroomuser.nickname = this.nickname;
        newroomuser.status = 'online';
        const newRoomUser = firebase.database().ref('roomusers/').push();
        newRoomUser.set(newroomuser);

      }
    });

    this.router.navigate(['/chatroom', roomname]);
  }




}
