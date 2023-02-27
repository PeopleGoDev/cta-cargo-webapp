import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { LoginInput } from '../model/logininput';
import { Result } from '../model/result';
import { UsuarioLoginInfo } from '../model/usuarioinfo';

@Injectable({
  providedIn: 'root'
})
export class AutenticacaoService {

  constructor(private httpClient: HttpClient) { }

  Autenticar(loginInput: LoginInput): Observable<Result<UsuarioLoginInfo>> {
    return this.httpClient.post( `${environment.BaseURL}v1/Account/Autenticar`, loginInput )
      .pipe(
        catchError(err => {
          throw err;
        })
      );
  }

}
