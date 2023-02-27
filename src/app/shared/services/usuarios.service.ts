import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { UsuarioInsertDto, UsuarioResetDto, UsuarioResponseDto, UsuarioUpdateDto } from '../model/dto/usuariodto';
import { Notificacao, Result } from '../model/result';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {

  constructor(private httpClient: HttpClient) 
  { }

  Listar(empresaId: number): Observable<Result<Array<UsuarioResponseDto>>> {

    return this.httpClient.get(`${environment.BaseURL}v1/Usuario/ListarUsuarios?empresaId=${empresaId}`)
      .pipe(
        catchError(err => {
          throw err;
        })
      );

  }

  async Atualizar(usuario: UsuarioUpdateDto): Promise<Result<UsuarioResponseDto>> {

    return this.httpClient.post<Result<UsuarioResponseDto>>(`${environment.BaseURL}v1/Usuario/AtualizarUsuario`, usuario)
      .toPromise()
      .then(res => {
        return new Result<UsuarioResponseDto>(
          res.Sucesso,
          res.Dados,
          res.Notificacoes
        );
      })
      .catch(err => {
        return new Result<UsuarioResponseDto>(
          false,
          null,
          [new Notificacao('9999', err)]
        );
      });

  }

  async Inserir(insereUsuario: UsuarioInsertDto): Promise<Result<UsuarioResponseDto>> {

    return this.httpClient.post<Result<UsuarioResponseDto>>(`${environment.BaseURL}v1/Usuario/InserirUsuario`, insereUsuario)
      .toPromise()
      .then(res => {
        return new Result<UsuarioResponseDto>(
          res.Sucesso,
          res.Dados,
          res.Notificacoes
        );
      })
      .catch(err => {
        return new Result<UsuarioResponseDto>(
          false,
          null,
          [new Notificacao('9999', err)]
        );
      });
    return null;
  
  }

  async Excluir(usuarioId: number): Promise<Result<UsuarioResponseDto>> {

    return this.httpClient.delete<Result<UsuarioResponseDto>>(`${environment.BaseURL}v1/Usuario/ExcluirUsuario?usuarioId=${usuarioId}`)
      .toPromise()
      .then(res => {
        return new Result<UsuarioResponseDto>(
          res.Sucesso,
          res.Dados,
          res.Notificacoes
        );
      })
      .catch(err => {
        return new Result<UsuarioResponseDto>(
          false,
          null,
          [new Notificacao('9999', err)]
        );
      });
    return null;
  }

  async Resetar(usuario: UsuarioResetDto): Promise<Result<string>> {

    return this.httpClient.post<Result<string>>(`${environment.BaseURL}v1/Usuario/ResetarUsuario`, usuario)
      .toPromise()
      .then(res => {
        return new Result<string>(
          res.Sucesso,
          res.Dados,
          res.Notificacoes
        );
      })
      .catch(err => {
        return new Result<string>(
          false,
          null,
          [new Notificacao('9999', err)]
        );
      });
    return null;
  }
}
