import { Injectable } from '@angular/core';
import { Notificacao, Result } from '../model/result';
import { HttpClient } from '@angular/common/http';
import { MasterInsertRequestDto, MasterListaResponseDto, MasterListarRequestDto, MasterResponseDto, MasterUpdateRequestDto, MasterVooResponseDto } from '../model/dto/masterdto';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})

export class MasterService {
  
  constructor(private httpClient: HttpClient) {
  }

  async Listar(input: MasterListarRequestDto): Promise<Result<Array<MasterResponseDto>>> {

    return this.httpClient.post<Result<Array<MasterResponseDto>>>(`${environment.BaseURL}v1/Master/ListarMasters`,input)
      .toPromise()
      .then(res => {
        return new Result<Array<MasterResponseDto>>(
          res.Sucesso,
          res.Dados,
          res.Notificacoes
        );
      })
      .catch(err => {
        return new Result<Array<MasterResponseDto>>(
          false,
          null,
          [new Notificacao('9999', err)]
        );
      });

  }

  async ListarMasterVoo(vooId: number): Promise<Result<Array<MasterVooResponseDto>>> {

    return this.httpClient.get<Result<Array<MasterVooResponseDto>>>(`${environment.BaseURL}v1/Master/ListarMastersVoo?vooId=${vooId}`)
      .toPromise()
      .then(res => {
        return new Result<Array<MasterVooResponseDto>>(
          res.Sucesso,
          res.Dados,
          res.Notificacoes
        );
      })
      .catch(err => {
        return new Result<Array<MasterVooResponseDto>>(
          false,
          null,
          [new Notificacao('9999', err)]
        );
      });

  }

  async ListarMasterLista(vooId: number): Promise<Result<Array<MasterListaResponseDto>>> {

    return this.httpClient.get<Result<Array<MasterListaResponseDto>>>(`${environment.BaseURL}v1/Master/ListarMastersListaPorVooId?vooId=${vooId}`)
      .toPromise()
      .then(res => {
        return new Result<Array<MasterListaResponseDto>>(
          res.Sucesso,
          res.Dados,
          res.Notificacoes
        );
      })
      .catch(err => {
        return new Result<Array<MasterListaResponseDto>>(
          false,
          null,
          [new Notificacao('9999', err)]
        );
      });

  }

  async Atualizar(master: MasterUpdateRequestDto): Promise<Result<MasterResponseDto>> {

    return this.httpClient.post<Result<MasterResponseDto>>(`${environment.BaseURL}v1/Master/AtualizarMaster`, master)
      .toPromise()
      .then(res => {
        return new Result<MasterResponseDto>(
          res.Sucesso,
          res.Dados,
          res.Notificacoes
        );
      })
      .catch(err => {
        return new Result<MasterResponseDto>(
          false,
          null,
          [new Notificacao('9999', err)]
        );
      });

  }

  async Inserir(insereMaster: MasterInsertRequestDto): Promise<Result<MasterResponseDto>> {

    return this.httpClient.post<Result<MasterResponseDto>>(`${environment.BaseURL}v1/Master/InserirMaster`, insereMaster)
      .toPromise()
      .then(res => {
        return new Result<MasterResponseDto>(
          res.Sucesso,
          res.Dados,
          res.Notificacoes
        );
      })
      .catch(err => {
        return new Result<MasterResponseDto>(
          false,
          null,
          [new Notificacao('9999', err)]
        );
      });
    return null;
  
  }

  async Excluir(masterId: number): Promise<Result<MasterResponseDto>> {

    return this.httpClient.delete<Result<MasterResponseDto>>(`${environment.BaseURL}v1/Master/ExcluirMaster?masterId=${masterId}`)
      .toPromise()
      .then(res => {
        return new Result<MasterResponseDto>(
          res.Sucesso,
          res.Dados,
          res.Notificacoes
        );
      })
      .catch(err => {
        return new Result<MasterResponseDto>(
          false,
          null,
          [new Notificacao('9999', err)]
        );
      });
    return null;
  }

}