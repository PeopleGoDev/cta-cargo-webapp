import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './shared/auth.guard';
import { NotfoundComponent } from './notfound/notfound.component';
import { VoosComponent } from './voos/voos.component';
import { MastersComponent } from './masters/masters.component';
import { HousesComponent } from './pages/houses/houses.component';
import { HomeComponent } from './home/home.component';
import { UsuariosComponent } from './usuarios/usuarios.component';
import { CiaaereasComponent } from './ciaaereas/ciaaereas.component';
import { ReceitaFederalComponent } from './pages/receita-federal/receita-federal.component';
import { UldmasterComponent } from './pages/uldmaster/uldmaster.component';
import { PortoIataComponent } from './porto-iata/porto-iata.component';
import { NaturezaCargaComponent } from './natureza-carga/natureza-carga.component';
import { AgenteCargaComponent } from './agente-carga/agente-carga.component';
import { ReceitaFederalHouseComponent } from './pages/receita-federal-house/receita-federal-house.component';
import { ConsultaComponent } from './consulta/consulta.component';
import { ReceitaFederalMasterComponent } from './pages/receita-federal-master/receita-federal-master.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
    runGuardsAndResolvers: 'always'
  }, {
    path: 'portal',
    component: AdminLayoutComponent,
    children: [
      { path: "voos", component: VoosComponent },
      { path: "masters", component: MastersComponent },
      { path: "houses", component: HousesComponent },
      { path: "painel", component: HomeComponent },
      { path: "usuarios", component: UsuariosComponent },
      { path: "ciasaerea", component: CiaaereasComponent },
      { path: "agentes-carga", component: AgenteCargaComponent },
      { path: "uldtag", component: UldmasterComponent },
      { path: "receita-federal", component: ReceitaFederalComponent },
      { path: "receita-federal-house", component: ReceitaFederalHouseComponent },
      { path: "receita-federal-master", component: ReceitaFederalMasterComponent },
      { path: "porto-iata", component: PortoIataComponent },
      { path: "natureza-carga", component: NaturezaCargaComponent },
      { path: "consulta", component: ConsultaComponent },
    ],
    canActivate: [AuthGuard]
  }, {
    path: 'login',
    component: LoginComponent
  }, {
    path: 'notfound',
    component: NotfoundComponent
  }, {
    path: '**',
    component: NotfoundComponent,
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: false, scrollPositionRestoration: 'enabled' })],
  exports: [RouterModule],
  providers: [AuthGuard],
})
export class AppRoutingModule { }