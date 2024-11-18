import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import firebase from 'firebase/compat/app';
import { switchMap, map } from 'rxjs/operators';
import { Observable } from 'rxjs';

export interface User {
  uid: string;
  email: string;
}

export interface Message {
  createdAt: firebase.firestore.FieldValue;
  id: string;
  from: string;
  msg: string;
  fromName: string;
  myMsg: boolean;
  map: boolean;
  coords?: {latitude: number, longitude: number};
}

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  currentUser!: firebase.User | null;

  constructor(private afAuth: AngularFireAuth, private afs: AngularFirestore) {
    this.afAuth.onAuthStateChanged((user) => {
      this.currentUser = user;
    });
  }

  async singup({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<any> {
    const credential = await this.afAuth.createUserWithEmailAndPassword(
      email,
      password
    );
    const uid = credential.user!.uid;
    return this.afs
      .doc(`users/${uid}`)
      .set({ uid, email: credential.user!.email });
  }

  signIn({email , password}: {email: string; password: string}) {
    return this.afAuth.signInWithEmailAndPassword(email, password);
  }

  signOut(): Promise<void> {
    return this.afAuth.signOut();
  }

  addChatMessage(msg : string , map : boolean = false , coords?: {latitude: number, longitude: number} ) {
    return this.afs.collection('messages').add({
      msg: msg,
      map,
      coords: coords || null,
      from: this.currentUser!.uid,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    })
  }

  // getChatMessages() {
  //   let users :  User[];
  //   return this.getUsers().pipe(
  //     switchMap( res => {
  //       users = res;
  //       return this.afs.collection('messages', ref => ref.orderBy("createdAt")) as unknown as Observable<any>
  //     }),
  //     map(messages => {
  //       for (let m of messages) {
  //         m.fromName = this.getUserForMsg(m.from, users);
  //         m.myMsg = this.currentUser?.uid === m.from;
  //       }
  //       return messages;
  //     })
  //   )
  // }

  getChatMessages() {
    let users: User[];
    return this.getUsers().pipe(
      switchMap((res) => {
        users = res;
        return this.afs
          .collection<Message>('messages', (ref) => ref.orderBy('createdAt'))
          .valueChanges({ idField: 'id' }); // Asegúrate de obtener los datos como un Observable<Message[]>
      }),
      map((messages) => {
        return messages.map((m) => {
          return {
            ...m,
            fromName: this.getUserForMsg(m.from, users),
            myMsg: this.currentUser?.uid === m.from,
          };
        });
      })
    );
  }
  

  private getUsers() {
    return this.afs.collection("users").valueChanges({idField: 'uid'}) as Observable<any>;
  }

  private getUserForMsg(msgFromId: string, users: User[]): string {
    for(let usr of users) {
      if (usr.uid == msgFromId) {
        return usr.email;
      }
    }
    return "Deleted";
  }

}
