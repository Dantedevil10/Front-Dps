import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;

  constructor() {
    this.socket = io('http://localhost:3000'); // endereço do seu backend
  }

  escutarLocalizacaoAtualizada(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('localizacaoAtualizada', (dados) => {
        observer.next(dados);
      });
    });
  }

  desconectar() {
    this.socket.disconnect();
  }
}
