import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Notificacao, Result } from '../model/result';
import { PortoIATAInsertRequestDto, PortoIATAResponseDto, PortoIATAUpdateRequestDto } from '../model/dto/portoiatadto';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PortoIATAService {

  constructor(private httpClient: HttpClient) { }

  async listar(empresaId: number): Promise<Result<Array<PortoIATAResponseDto>>> {

    return this.httpClient.get<Result<Array<PortoIATAResponseDto>>>(`${environment.BaseURL}v1/PortoIATA/ListarPortosIATA?empresaId=${empresaId}`)
      .toPromise()
      .then(res => {
        return new Result<Array<PortoIATAResponseDto>>(
          res.Sucesso,
          res.Dados,
          res.Notificacoes
        );
      })
      .catch(err => {
        return new Result<Array<PortoIATAResponseDto>>(
          false,
          null,
          [new Notificacao('9999', err)]
        );
      });

  }

  async inserir(input: PortoIATAInsertRequestDto): Promise<Result<PortoIATAResponseDto>> {

    return this.httpClient.post<Result<PortoIATAResponseDto>>(`${environment.BaseURL}v1/PortoIATA/InserirPortoIATA`, input)
      .toPromise()
      .then(res => {
        return new Result<PortoIATAResponseDto>(
          res.Sucesso,
          res.Dados,
          res.Notificacoes
        );
      })
      .catch(err => {
        return new Result<PortoIATAResponseDto>(
          false,
          null,
          [new Notificacao('9999', err)]
        );
      });

  }

  async atualizar(input: PortoIATAUpdateRequestDto): Promise<Result<PortoIATAResponseDto>> {

    return this.httpClient.post<Result<PortoIATAResponseDto>>(`${environment.BaseURL}v1/PortoIATA/AtualizarPortoIATA`, input)
      .toPromise()
      .then(res => {
        return new Result<PortoIATAResponseDto>(
          res.Sucesso,
          res.Dados,
          res.Notificacoes
        );
      })
      .catch(err => {
        return new Result<PortoIATAResponseDto>(
          false,
          null,
          [new Notificacao('9999', err)]
        );
      });

  }

  async excluir(portoId: number): Promise<Result<PortoIATAResponseDto>> {

    return this.httpClient.delete<Result<PortoIATAResponseDto>>(`${environment.BaseURL}v1/PortoIATA/ExcluirPortoIATA?portoIATAId=${ portoId }`)
    .toPromise()
    .then(res => {
      return new Result<PortoIATAResponseDto>(
        res.Sucesso,
        res.Dados,
        res.Notificacoes
      );
    })
    .catch(err => {
      return new Result<PortoIATAResponseDto>(
        false,
        null,
        [new Notificacao('9999', err)]
      );
    });

  }

}
