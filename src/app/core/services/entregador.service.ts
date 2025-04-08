import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EntregadorService {
  private readonly API = 'http://localhost:3000/api/entregadores';

  constructor(private http: HttpClient) {}

  listar(): Observable<any[]> {
    return this.http.get<any[]>(this.API);
  }

  buscar(id: string): Observable<any> {
    return this.http.get<any>(`${this.API}/${id}`);
  }
}
