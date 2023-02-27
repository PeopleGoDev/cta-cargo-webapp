import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { ListaUldMasterRequest, MasterNumeroUldSumario, UldMasterDeleteByIdInput, UldMasterDeleteByTagInput, UldMasterInsertRequest, UldMasterNumeroQuery, UldMasterResponseDto, UldMasterUpdateRequest } from '../model/dto/uldmasterdto';
import { Notificacao, Result } from '../model/result';

@Injectable({
  providedIn: 'root'
})
export class UldmasterService {

  constructor(private httpClient: HttpClient) { }

  async listarUldMasterPorId(uldId: number): Promise<Result<Array<UldMasterResponseDto>>> {

    return this.httpClient.get<Result<Array<UldMasterResponseDto>>>(`${environment.BaseURL}v1/Uld/PegarUldMasterPorId?uldId=${uldId}`)
      .toPromise()
      .then(res => {
        return new Result<Array<UldMasterResponseDto>>(
          res.Sucesso,
          res.Dados,
          res.Notificacoes
        );
      })
      .catch(err => {
        return new Result<Array<UldMasterResponseDto>>(
          false,
          null,
          [new Notificacao('9999', err)]
        );
      });
  }

  async listarUldMasterPorMasterId(masterId: number): Promise<Result<Array<UldMasterResponseDto>>> {

    return this.httpClient.get<Result<Array<UldMasterResponseDto>>>(`${environment.BaseURL}v1/Uld/ListarUldMasterPorMasterId?masterId=${masterId}`)
      .toPromise()
      .then(res => {
        return new Result<Array<UldMasterResponseDto>>(
          res.Sucesso,
          res.Dados,
          res.Notificacoes
        );
      })
      .catch(err => {
        return new Result<Array<UldMasterResponseDto>>(
          false,
          null,
          [new Notificacao('9999', err)]
        );
      });
  }

  async listarUldMasterPorVooId(vooId: number): Promise<Result<Array<UldMasterNumeroQuery>>> {

    return this.httpClient.get<Result<Array<UldMasterNumeroQuery>>>(`${environment.BaseURL}v1/Uld/ListarUldMasterPorVooId?vooId=${vooId}`)
      .toPromise()
      .then(res => {
        return new Result<Array<UldMasterNumeroQuery>>(
          res.Sucesso,
          res.Dados,
          res.Notificacoes
        );
      })
      .catch(err => {
        return new Result<Array<UldMasterNumeroQuery>>(
          false,
          null,
          [new Notificacao('9999', err)]
        );
      });
  }

  async listarUldMasterPorLinha(input: ListaUldMasterRequest): Promise<Result<Array<UldMasterResponseDto>>> {

    return this.httpClient.post<Result<Array<UldMasterResponseDto>>>(`${environment.BaseURL}v1/Uld/ListarUldMasterPorLinha`, input)
      .toPromise()
      .then(res => {
        return new Result<Array<UldMasterResponseDto>>(
          res.Sucesso,
          res.Dados,
          res.Notificacoes
        );
      })
      .catch(err => {
        return new Result<Array<UldMasterResponseDto>>(
          false,
          null,
          [new Notificacao('9999', err)]
        );
      });
  }

  async listarMasterUldSumario(input: ListaUldMasterRequest): Promise<Result<Array<MasterNumeroUldSumario>>> {

    return this.httpClient.post<Result<Array<MasterNumeroUldSumario>>>(`${environment.BaseURL}v1/Uld/ListarMasterUldSumario`, input)
      .toPromise()
      .then(res => {
        return new Result<Array<MasterNumeroUldSumario>>(
          res.Sucesso,
          res.Dados,
          res.Notificacoes
        );
      })
      .catch(err => {
        return new Result<Array<MasterNumeroUldSumario>>(
          false,
          null,
          [new Notificacao('9999', err)]
        );
      });

  }

  async inserirUldMaster(input: Array<UldMasterInsertRequest>): Promise<Result<Array<UldMasterResponseDto>>> {

    return await this.httpClient.post<Result<Array<UldMasterResponseDto>>>(`${environment.BaseURL}v1/Uld/InserirUldMaster`, input)
      .toPromise()
      .then(res => {
        return new Result<Array<UldMasterResponseDto>>(
          res.Sucesso,
          res.Dados,
          res.Notificacoes
        );
      })
      .catch(err => {
        return new Result<Array<UldMasterResponseDto>>(
          false,
          null,
          [new Notificacao('9999', err)]
        );
      });
  }

  async atualizarUldMaster(input: Array<UldMasterUpdateRequest>): Promise<Result<Array<UldMasterResponseDto>>> {

    return await this.httpClient.post<Result<Array<UldMasterResponseDto>>>(`${environment.BaseURL}v1/Uld/AtualizarUldMaster`, input)
      .toPromise()
      .then(res => {
        return new Result<Array<UldMasterResponseDto>>(
          res.Sucesso,
          res.Dados,
          res.Notificacoes
        );
      })
      .catch(err => {
        return new Result<Array<UldMasterResponseDto>>(
          false,
          null,
          [new Notificacao('9999', err)]
        );
      });
  }

  async excluirUldMaster(input: UldMasterDeleteByIdInput): Promise<Result<string>> {

    return this.httpClient.post<Result<string>>(`${environment.BaseURL}v1/Uld/ExcluirUldMaster`, input)
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
  }

  async excluirUld(input: UldMasterDeleteByTagInput): Promise<Result<string>> {

    return this.httpClient.post<Result<string>>(`${environment.BaseURL}v1/Uld/ExcluirUld`, input)
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
  }

}