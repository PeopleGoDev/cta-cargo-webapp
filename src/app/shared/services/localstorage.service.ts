import { Inject, Injectable } from '@angular/core';
import { LOCAL_STORAGE, StorageService } from 'ngx-webstorage-service';
import { VooSelecionado } from '../model/vooselecionado';
import { UsuarioLoginResponse } from '../proxy/ctaapi';

// key that is used to access the data in local storageconst 
const STORAGE_KEY = 'local_autenticado';
const STARAGE_KEY2 = 'voo_selecionado'

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  constructor(@Inject(LOCAL_STORAGE) private storage: StorageService) { }

  public storeOnLocalStorage(informacaoLogin: UsuarioLoginResponse): void {
    // insert updated array to local storage
    this.storage.set(STORAGE_KEY, informacaoLogin);
  }

  public storeOnLocalStorageVoo(vooSelecionado: VooSelecionado): void {
    // insert updated array to local storage
    this.storage.set(STARAGE_KEY2, vooSelecionado);
  }

  public getLocalStore(): UsuarioLoginResponse {
    return this.storage.get(STORAGE_KEY);
  }

  public getLocalStoreVoo(): VooSelecionado {
    return this.storage.get(STARAGE_KEY2);
  }

  public logout() {
    this.storage.set(STORAGE_KEY, undefined);
  }

}
