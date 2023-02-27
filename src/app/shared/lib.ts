import { Injectable } from "@angular/core";

@Injectable()
export class AWBReference {
  
  public ValidaMasterNumero(e) {
    
    if (typeof e != "string" || Number.isNaN(Number(e)))
      return false;
    if (e.length != 11)
      return false;
    
    let digitos7 = Number(e.substring(10, 3));
    let digito = Number(e.substring(10));
    let digitoesperado = digitos7 % 7;
    if (digito == digitoesperado)
      return true;
    return false;
  }
}