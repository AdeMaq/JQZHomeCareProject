import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ParseLocationLinkRequest {
  link: string;
}

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  formattedAddress: string | null;
  source: 'link' | 'geocoded';
}

@Injectable({
  providedIn: 'root',
})
export class LocationService {
  private readonly apiUrl = 'http://localhost:5212/api/locations';

  constructor(private readonly http: HttpClient) {}

  /**
   * Parses a Google Maps, WhatsApp, Apple Maps, geo URI,
   * coordinate string, or plain address.
   */
  parseLocationLink(link: string): Observable<LocationCoordinates> {
    const request: ParseLocationLinkRequest = {
      link: link.trim(),
    };

    return this.http.post<LocationCoordinates>(`${this.apiUrl}/parse-link`, request);
  }
}
