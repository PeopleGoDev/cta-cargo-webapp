import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule, LOCALE_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { AppRoutingModule } from './app.routing';
import { NavbarModule } from './shared/navbar/navbar.module';
import { FooterModule } from './shared/footer/footer.module';
import { SidebarModule } from './sidebar/sidebar.module';
import { AppComponent } from './app.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { NotfoundComponent } from './notfound/notfound.component';
import { Interceptor } from './auth/interceptor.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ModalModule } from 'ngx-bootstrap/modal';
import { UsuariosModule } from './usuarios/usuarios.module';
import { LoginModule } from './login/login.module';
import { HomeModule } from './home/home.module';
import { CiaaereasModule } from './ciaaereas/ciaaereas.module';
import { VoosModule } from './voos/voos.module';
import { MastersModule } from './masters/masters.module';
import { HousesModule } from './houses/houses.module';
import { registerLocaleData } from '@angular/common';
import ptBr from '@angular/common/locales/pt';
import { locale, loadMessages } from 'devextreme/localization';
import config from 'devextreme/core/config';
import { ReceitaFederalModule } from './receita-federal/receita-federal.module';
import { UldmasterModule } from './uldmaster/uldmaster.module';
import { PortoIataModule } from './porto-iata/porto-iata.module';
import { NaturezaCargaModule } from './natureza-carga/natureza-carga.module';
import { URL_BASE_URL_API } from './shared/proxy/ctaapi';
import { environment } from 'environments/environment';
import { AgenteCargaModule } from './agente-carga/agente-carga.module';
import { ReceitaFederalHouseModule } from './receita-federal-house/receita-federal-house.module';
import { NgxSpinnerModule } from "ngx-spinner";
import { SharedModule } from './shared/shared.module';
import { ConsultaModule } from './consulta/consulta.module';

let messagesptBR = require('devextreme/localization/messages/pt.json');
loadMessages(messagesptBR);
registerLocaleData(ptBr)
locale('pt-BR');
config({
  defaultCurrency: 'BRL'
});

@NgModule({
  imports: [
    BrowserAnimationsModule,
    FormsModule,
    RouterModule,
    Interceptor,
    HttpClientModule,
    NavbarModule,
    FooterModule,
    SidebarModule,
    AppRoutingModule,
    NgbModule,
    UsuariosModule,
    LoginModule,
    CommonModule,
    HomeModule,
    CiaaereasModule,
    VoosModule,
    MastersModule,
    ConsultaModule,
    UldmasterModule,
    HousesModule,
    ReceitaFederalModule,
    ReceitaFederalHouseModule,
    PortoIataModule,
    NaturezaCargaModule,
    AgenteCargaModule,
    NgxSpinnerModule,
    SharedModule,
    ModalModule.forRoot(),
  ],
  declarations: [
    AppComponent,
    AdminLayoutComponent,
    NotfoundComponent,
  ],
  exports: [],
  providers: [
    { provide: LOCALE_ID, useValue: 'pt-BR' },
    {
      provide: URL_BASE_URL_API,
      useValue: environment.BaseUrlApiCta,
      multi: true,
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
