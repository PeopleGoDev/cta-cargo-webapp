import { Component, Input, OnInit } from '@angular/core';
import { MasterNumeroUldSumario } from 'app/shared/proxy/ctaapi';

@Component({
  selector: 'app-uld-master-detail',
  templateUrl: './uld-master-detail.component.html',
  styleUrls: ['./uld-master-detail.component.scss']
})
export class UldMasterDetailComponent implements OnInit {

@Input() uld: MasterNumeroUldSumario = undefined;

  constructor() { }

  ngOnInit(): void {
  }

  calculateWeightPerFlight(): number {
    if (!this.uld || !this.uld.Ulds || this.uld.Ulds.length == 0) return 0;
    const uldWeights: number =  this.uld.Ulds.map(b => b.Peso).reduce( (a,b) => a + b, 0);
    return uldWeights / this.uld.MasterPeso;
  }

  calculateTotalPiecesPerUld(): number {
    if (!this.uld || !this.uld.Ulds || this.uld.Ulds.length == 0) return 0;
    return this.uld.Ulds.map(b => b.QuantidadePecas).reduce( (a,b) => a + b, 0);
  }

  calculateTotalWeightsPerUld(): number {
    if (!this.uld || !this.uld.Ulds || this.uld.Ulds.length == 0) return 0;
    return this.uld.Ulds.map(b => b.Peso).reduce( (a,b) => a + b, 0);
  }

}
