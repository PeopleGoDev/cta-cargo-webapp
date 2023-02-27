import { NgModule } from "@angular/core";
import { CnpjPipe } from "./pipe/cnpj.pipe";
import { MasterPipe } from "./pipe/master.pipe";
import { VooPipe } from "./pipe/voo.pipe";


@NgModule({
  imports: [
    // dep modules
  ],
  declarations: [ 
    CnpjPipe,
    MasterPipe,
    VooPipe
  ],
  exports: [
    CnpjPipe,
    MasterPipe,
    VooPipe
  ]
})
export class PipesModule {}