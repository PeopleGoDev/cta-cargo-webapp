import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ListaUldMasterRequest, MasterNumeroUldSumario, UldClient } from 'app/shared/proxy/ctaapi';
import { DxDataGridComponent } from 'devextreme-angular';
import notify from 'devextreme/ui/notify';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-masteruldsumario',
  templateUrl: './masteruldsumario.component.html',
  styleUrls: ['./masteruldsumario.component.scss'],
})

export class MasteruldsumarioComponent implements OnInit {
  @ViewChild('gridContainer', { static: false }) dataGrid: DxDataGridComponent;
  
  @Input() uldLista: MasterNumeroUldSumario[] = [];

  constructor(private UldClient: UldClient) { }

  ngOnInit(): void {
  }

  calcularPorcentagemPecas(rowData: MasterNumeroUldSumario) {
    const uldPecas = rowData.Ulds.map( x => x.QuantidadePecas)
      .reduce((a,b) => a + b, 0);
    return (uldPecas / rowData.MasterPecas);
  }

  calcularPorcentagemPeso(rowData: MasterNumeroUldSumario) {
    const uldPeso = rowData.Ulds.map( x => x.Peso)
      .reduce((a,b) => a + b, 0);
    return (uldPeso / rowData.MasterPeso);
  }

}
