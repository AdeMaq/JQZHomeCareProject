import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

// =========================
// CITY MODELS
// =========================

export interface City {
  id: string;
  name: string;
}

export interface CreateCityRequest {
  name: string;
}

export interface UpdateCityRequest {
  name: string;
}

// =========================
// AREA MODELS
// =========================

export interface Area {
  id: string;
  name: string;
  cityId: string;
  cityName?: string;
}

export interface CreateAreaRequest {
  name: string;
  cityId: string;
}

export interface UpdateAreaRequest {
  name: string;
  cityId: string;
}

// =========================
// SERVICE
// =========================

@Injectable({
  providedIn: 'root',
})
export class CityAreaService {
  private readonly http = inject(HttpClient);

  private readonly citiesApiUrl = 'http://localhost:5212/api/cities';

  private readonly areasApiUrl = 'http://localhost:5212/api/areas';

  // =========================
  // CITY CACHE
  // =========================

  private citiesCache: City[] = [];

  // =========================
  // CITIES
  // =========================

  getCities(): Observable<City[]> {
    return this.http.get<City[]>(this.citiesApiUrl).pipe(
      tap((cities) => {
        this.citiesCache = cities;
      }),
    );
  }

  getCachedCityById(id: string): City | undefined {
    return this.citiesCache.find((city) => city.id === id);
  }

  clearCitiesCache(): void {
    this.citiesCache = [];
  }

  getCityById(id: string): Observable<City> {
    return this.http.get<City>(`${this.citiesApiUrl}/${id}`);
  }

  getAreasByCity(cityId: string): Observable<Area[]> {
    return this.http.get<Area[]>(`${this.citiesApiUrl}/${cityId}/areas`);
  }

  createCity(request: CreateCityRequest): Observable<City> {
    return this.http.post<City>(this.citiesApiUrl, request);
  }

  updateCity(id: string, request: UpdateCityRequest): Observable<void> {
    return this.http.put<void>(`${this.citiesApiUrl}/${id}`, request);
  }

  deleteCity(id: string): Observable<void> {
    return this.http.delete<void>(`${this.citiesApiUrl}/${id}`);
  }

  // =========================
  // AREAS
  // =========================

  getAreas(): Observable<Area[]> {
    return this.http.get<Area[]>(this.areasApiUrl);
  }

  getAreaById(id: string): Observable<Area> {
    return this.http.get<Area>(`${this.areasApiUrl}/${id}`);
  }

  createArea(request: CreateAreaRequest): Observable<Area> {
    return this.http.post<Area>(this.areasApiUrl, request);
  }

  updateArea(id: string, request: UpdateAreaRequest): Observable<void> {
    return this.http.put<void>(`${this.areasApiUrl}/${id}`, request);
  }

  deleteArea(id: string): Observable<void> {
    return this.http.delete<void>(`${this.areasApiUrl}/${id}`);
  }
}
