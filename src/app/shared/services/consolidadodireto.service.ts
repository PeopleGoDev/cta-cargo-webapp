import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
  })
  export class ConsolidadoDiretoService {

    data: any = [{ Codigo: "C", Descricao: "Consolidado"},
    { Codigo:"D", Descricao: "Direto"}];

    constructor() {}

    Listar() {
        return this.data;
    }
  }