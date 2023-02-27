import { cnpj } from "cpf-cnpj-validator";

export class CommonUtil {
    static validaCnpj(e: string) {
        if (e.length == 14) {
          return cnpj.isValid(e);
        }
        return false;
      }

}
