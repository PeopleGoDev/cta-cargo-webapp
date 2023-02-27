import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Notificacao, Result } from '../model/result';
import { VooResponseDto, VooListarInputDto, VooUpdateRequestDto, VooInsertRequestDto, VooListaResponseDto, VooListarListaInputDto } from '../model/dto/voodto';
import { environment } from 'environments/environment';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class VoosService {

  constructor(private httpClient: HttpClient) {
  }

  Listar(vooListarInputDto: VooListarInputDto): Observable<Result<Array<VooResponseDto>>> {

    return this.httpClient.post(`${environment.BaseURL}v1/Voo/ListarVoos`, vooListarInputDto)
      .pipe(
        catchError(err => {
          throw err;
        })
      );

  }

  async ListarVooLista(input: VooListarInputDto): Promise<Result<Array<VooListaResponseDto>>> {

    return this.httpClient.post<Result<Array<VooListaResponseDto>>>(`${environment.BaseURL}v1/Voo/ListarVoosLista`, input)
      .toPromise()
      .then(res => {
        return new Result<Array<VooListaResponseDto>>(
          res.Sucesso,
          res.Dados,
          res.Notificacoes
        );
      })
      .catch(err => {
        return new Result<Array<VooListaResponseDto>>(
          false,
          null,
          [new Notificacao('9999', err)]
        );
      });

  }

  async VooPodId(vooId: number): Promise<Result<VooResponseDto>> {

    return this.httpClient.get<Result<VooResponseDto>>(`${environment.BaseURL}v1/Voo/ObterVooPorId?vooId=${vooId}`)
      .toPromise()
      .then(res => {
        return new Result<VooResponseDto>(
          res.Sucesso,
          res.Dados,
          res.Notificacoes
        );
      })
      .catch(err => {
        return new Result<VooResponseDto>(
          false,
          null,
          [new Notificacao('9999', err)]
        );
      });

  }

  async Atualizar(voo: VooUpdateRequestDto): Promise<Result<VooResponseDto>> {

    return this.httpClient.post<Result<VooResponseDto>>(`${environment.BaseURL}v1/Voo/AtualizarVoo`, voo)
      .toPromise()
      .then(res => {
        return new Result<VooResponseDto>(
          res.Sucesso,
          res.Dados,
          res.Notificacoes
        );
      })
      .catch(err => {
        return new Result<VooResponseDto>(
          false,
          null,
          [new Notificacao('9999', err)]
        );
      });

  }

  async Inserir(insereVoo: VooInsertRequestDto): Promise<Result<VooResponseDto>> {

    return this.httpClient.post<Result<VooResponseDto>>(`${environment.BaseURL}v1/Voo/InserirVoo`, insereVoo)
      .toPromise()
      .then(res => {
        return new Result<VooResponseDto>(
          res.Sucesso,
          res.Dados,
          res.Notificacoes
        );
      })
      .catch(err => {
        return new Result<VooResponseDto>(
          false,
          null,
          [new Notificacao('9999', err)]
        );
      });
    return null;
  
  }

  async Excluir(vooId: number): Promise<Result<VooResponseDto>> {

    return this.httpClient.delete<Result<VooResponseDto>>(`${environment.BaseURL}v1/Voo/ExcluirVoo?vooId=${vooId}`)
      .toPromise()
      .then(res => {
        return new Result<VooResponseDto>(
          res.Sucesso,
          res.Dados,
          res.Notificacoes
        );
      })
      .catch(err => {
        return new Result<VooResponseDto>(
          false,
          null,
          [new Notificacao('9999', err)]
        );
      });
    return null;
  }

}
