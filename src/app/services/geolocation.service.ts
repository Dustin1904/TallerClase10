import { Injectable } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import { GoogleMap } from '@capacitor/google-maps';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class GeolocationService {
  constructor() {}

  async ubicacion() {
    return await Geolocation.getCurrentPosition({ enableHighAccuracy: true });
  }

  async mapa(
    id: string,
    element: HTMLElement,
    coords: { latitude: number; longitude: number }
  ) {
    const googleMap = await GoogleMap.create({
      id,
      element,
      apiKey: environment.googleApi,
      config: {
        disableDefaultUI: true,
        center: { lat: coords?.latitude, lng: coords?.longitude },
        zoom: 16,
      },
    });
    await googleMap.addMarker({coordinate: { lat: coords.latitude, lng: coords.longitude }});
    return googleMap;
  }
}
