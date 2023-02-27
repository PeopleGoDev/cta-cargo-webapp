import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { CertificadoDigitalResponseDto } from '../model/dto/certificadodigitaldto';
import { Notificacao, Result } from '../model/result';

@Injectable({
  providedIn: 'root'
})
export class CertificadoService {

  constructor(private httpClient: HttpClient) { }

  
  async Listar(empresaId: number): Promise<Result<Array<CertificadoDigitalResponseDto>>> {

    return await this.httpClient.get<Result<Array<CertificadoDigitalResponseDto>>>(`${environment.BaseURL}v1/CertificadoDigital/ListarCertificadosDigitais?empresaId=${empresaId}`)
      .toPromise()
      .then(res => {
        return new Result<Array<CertificadoDigitalResponseDto>>(
          res.Sucesso,
          res.Dados,
          res.Notificacoes
        );
      })
      .catch(err => {
        return new Result<Array<CertificadoDigitalResponseDto>>(
          false,
          null,
          [new Notificacao('9999', err)]
        );
      });
  }
}
