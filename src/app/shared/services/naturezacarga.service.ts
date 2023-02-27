import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Notificacao, Result } from '../model/result';
import { environment } from 'environments/environment';
import { NaturezaCargaInsertRequestDto, NaturezaCargaResponseDto, NaturezaCargaUpdateRequestDto } from '../model/dto/naturezaoperacaodto';

@Injectable({
    providedIn: 'root'
})
export class NaturezaCargaService {

    constructor(private httpClient: HttpClient) { }

    async listar(empresaId: number): Promise<Result<Array<NaturezaCargaResponseDto>>> {

        return this.httpClient.get<Result<Array<NaturezaCargaResponseDto>>>(`${environment.BaseURL}v1/NaturezaCarga/ListarNaturezaCarga?empresaId=${empresaId}`)
            .toPromise()
            .then(res => {
                return new Result<Array<NaturezaCargaResponseDto>>(
                    res.Sucesso,
                    res.Dados,
                    res.Notificacoes
                );
            })
            .catch(err => {
                return new Result<Array<NaturezaCargaResponseDto>>(
                    false,
                    null,
                    [new Notificacao('9999', err)]
                );
            });

    }

    async inserir(input: NaturezaCargaInsertRequestDto): Promise<Result<NaturezaCargaResponseDto>> {

        return this.httpClient.post<Result<NaturezaCargaResponseDto>>(`${environment.BaseURL}v1/NaturezaCarga/InserirNaturezaCarga`, input)
            .toPromise()
            .then(res => {
                return new Result<NaturezaCargaResponseDto>(
                    res.Sucesso,
                    res.Dados,
                    res.Notificacoes
                );
            })
            .catch(err => {
                return new Result<NaturezaCargaResponseDto>(
                    false,
                    null,
                    [new Notificacao('9999', err)]
                );
            });

    }

    async atualizar(input: NaturezaCargaUpdateRequestDto): Promise<Result<NaturezaCargaResponseDto>> {

        return this.httpClient.post<Result<NaturezaCargaResponseDto>>(`${environment.BaseURL}v1/NaturezaCarga/AtualizarNaturezaCarga`, input)
            .toPromise()
            .then(res => {
                return new Result<NaturezaCargaResponseDto>(
                    res.Sucesso,
                    res.Dados,
                    res.Notificacoes
                );
            })
            .catch(err => {
                return new Result<NaturezaCargaResponseDto>(
                    false,
                    null,
                    [new Notificacao('9999', err)]
                );
            });

    }

    async excluir(naturezaCargaId: number): Promise<Result<NaturezaCargaResponseDto>> {

        return this.httpClient.delete<Result<NaturezaCargaResponseDto>>(`${environment.BaseURL}v1/NaturezaCarga/ExcluirNaturezaCarga?naturezaCargaId=${naturezaCargaId}`)
            .toPromise()
            .then(res => {
                return new Result<NaturezaCargaResponseDto>(
                    res.Sucesso,
                    res.Dados,
                    res.Notificacoes
                );
            })
            .catch(err => {
                return new Result<NaturezaCargaResponseDto>(
                    false,
                    null,
                    [new Notificacao('9999', err)]
                );
            });

    }

}
