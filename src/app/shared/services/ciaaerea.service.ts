import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CiaAerea } from '../model/ciaaerea';
import { CiaAereaUsuario } from '../model/ciaaereausuario';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { catchError } from 'rxjs/operators';
import { Notificacao, Result } from '../model/result';
import { CiaAereaInsertDto, CiaAereaResponseDto, CiaAereaUpdateDto } from '../model/dto/ciaaereadto';
import { CiaAereaSimplesResponseDto } from '../model/dto/ciaaereadto';

@Injectable({
  providedIn: 'root'
})

export class CiaaereaService {

  constructor(private httpClient: HttpClient) 
  { }

  ListarSimples(empresaId): Observable<Result<Array<CiaAereaSimplesResponseDto>>> {
    return this.httpClient.get(`${environment.BaseURL}v1/CiaAerea/ListarCiasAereasSimples?empresaId=${empresaId}`)
      .pipe(
        catchError(err => {
          throw err;
        })
      );
  }

}
