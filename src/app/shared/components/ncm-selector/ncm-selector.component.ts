import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { NcmClient } from 'app/shared/proxy/ctaapi';
import CustomStore from 'devextreme/data/custom_store';

export interface NcmList {
  code: string,
  description: string,
}

@Component({
  selector: 'app-ncm-selector',
  templateUrl: './ncm-selector.component.html',
  styleUrls: ['./ncm-selector.component.css']
})
export class NcmSelectorComponent implements OnInit {
  @Input() value: string[];
  @Output() valueChange = new EventEmitter<string[]>();
  @Input() readOnly: boolean = false;
  @Output() onItemSelected: EventEmitter<NcmList[]> = new EventEmitter<NcmList[]>();

  clientsStore: CustomStore;
  selectedItens: NcmList[] = [];
  textValue: string = '';
  startComponent: boolean = false;

  constructor(private ncmClient: NcmClient) {
    this.clientsStore = new CustomStore({
      key: 'Id',
      useDefaultSearch: true,
      load(loadOptions: any) {
        return ncmClient.search(loadOptions.filter[0][2])
          .toPromise()
          .then((res) => {
            return { data: res.result }
          })
          .catch((error) => { throw 'Data Loading Error'; });
      },
    });
  }

  ngOnInit(): void {
    this.loadValues();
  }

  async loadValues() {
    if(this.value) {
      const res = await this.ncmClient.searchcodes(this.value)
      .subscribe(res => {
        this.value.forEach(item => {
          const found = res.result.find(x => x.Codigo == item);
          if(found)
            this.selectedItens.push({ code: item, description: found.DescricaoConcatenada })
          else
          this.selectedItens.push({ code: item, description: null })
        })
      }, error => {
        console.log(error);
      });
    }
  }

  onSelectionChanged(e: any) {
    if (e.selectedItem) {
      const foundItem = this.selectedItens.find(x => x.code == e.selectedItem.Codigo);
      if (foundItem)
        return;
      this.selectedItens.push({ code: e.selectedItem.Codigo, description: e.selectedItem.DescricaoConcatenada });
      if(!this.value)
        this.value=[];
      this.value.push(e.selectedItem.Codigo);
      this.emitChange();
    }
  }

  removeItem(e: any) {
    const foundIndex = this.selectedItens.findIndex(x => x.code == e.code);
    const foundIndexValue = this.value.findIndex(x => x == e.code);
    if (foundIndex > -1) {
      this.selectedItens.splice(foundIndex, 1);
      this.value.splice(foundIndexValue,1);
      this.emitChange();
    }
  }

  emitChange() {
    this.onItemSelected.emit(this.selectedItens);
    this.valueChange.emit(this.value);
    this.textValue = "";
  }

}
