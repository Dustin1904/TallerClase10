import { Component, OnInit, ViewChild } from '@angular/core';
import { IonContent } from '@ionic/angular';
import { Observable } from 'rxjs';
import { ChatService } from '../../services/chat.service';
import { Router } from '@angular/router';
import { GeolocationService } from 'src/app/services/geolocation.service';
import { GoogleMap } from '@capacitor/google-maps';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {
  @ViewChild(IonContent) content!: IonContent;

  messages!: Observable<any[]>;
  mapas: GoogleMap[] = [];
  newMsg = '';

  constructor(private chatService: ChatService, private router: Router , private geolocationservice: GeolocationService) { }

  ngOnInit() {
    this.messages = this.chatService.getChatMessages();
  }

  ionViewDidEnter(){
    this.messages.subscribe((messages) => {
      this.loadMaps(messages)
    })
  }

  sendMessage() {
    this.chatService.addChatMessage(this.newMsg).then(() => {
      this.newMsg = '';
      this.content.scrollToBottom();
    });
  }

  signOut() {
    this.chatService.signOut().then(() => {
      this.router.navigateByUrl('/', { replaceUrl: true });
    });
  }

  sendCurrentPosition(){
    this.geolocationservice.ubicacion().then(( {coords} ) => {
      const cords = {latitude: coords.latitude , longitude: coords.longitude};
      this.chatService.addChatMessage(this.newMsg , true , cords)
    }).catch((error) => {
      console.log('Error: ' + error);
    })
  }

  async loadMaps(messages : any[]) {
    for (let message of messages) {
      if(message.map){
        const mapId = `map-${message.id}`
        const mapRef = document.getElementById(mapId);
        console.log(mapRef);
        const mapa = await this.geolocationservice.mapa(mapId, mapRef! , message.coords!);
        this.mapas.push(mapa);
      }
    }
  }

}