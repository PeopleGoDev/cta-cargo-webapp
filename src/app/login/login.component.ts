import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LocalStorageService } from 'app/shared/services/localstorage.service';
import notify from 'devextreme/ui/notify';
import { AccountClient, UserSelectCompany, UsuarioLoginRequest } from 'app/shared/proxy/ctaapi';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  returnUrl: string;
  usuario: string;
  senha: string;
  novasenha: string;
  novasenhaconfirmacao: string;
  buttonText: string = "Entrar";
  loadingVisible: boolean = false;
  alterarSenha: boolean = false;
  selecionaEmpresa: boolean = false;
  companies: UserSelectCompany[];
  selectedCompanyId: number = -1;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private localstorage: LocalStorageService,
    private accountClient: AccountClient,
  ) { }

  ngOnInit(): void {

    // get return url from route parameters or default to '/'
    this.localstorage.logout();
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  onSubmit() {

    if (!this.selecionaEmpresa)
      this.loginUserPassword();

  }

  loginUserPassword() {

    this.loadingVisible = true;
    let loginInput: UsuarioLoginRequest = {
      Email: this.usuario,
      Senha: this.senha
    }

    if (this.alterarSenha == true) {
      loginInput.AlterarSenha = true;
      loginInput.NovaSenha = this.novasenha;
      loginInput.NovaSenhaConfirmacao = this.novasenhaconfirmacao;
    }

    this.accountClient.autenticar(loginInput)
      .subscribe(res => {
        this.loadingVisible = false;
        if (res.result.Sucesso) {
          if (res.result.Dados.AlterarSenha) {
            this.alterarSenha = true;
          }
          else if (res.result.Dados.SelectCompany) {
            this.localstorage.storeOnLocalStorage(res.result.Dados);
            this.companies = res.result.Dados.SelectCompanies;
            this.selecionaEmpresa = true;
          }
          else {
            this.localstorage.storeOnLocalStorage(res.result.Dados);
            this.router.navigate(['/portal']);
          }
        }
        else
          notify(res.result.Notificacoes[0].Mensagem, 'error', 3000);
      },
        err => {
          notify(err, 'error', 3000);
          this.loadingVisible = false;
        }
      );
  }

  loginSwitchCompany() {
    this.loadingVisible = true;

    this.accountClient.switchCompany(this.selectedCompanyId)
      .subscribe(res => {
        this.loadingVisible = false;
        if (res.result.Sucesso) {
          this.localstorage.storeOnLocalStorage(res.result.Dados);
          this.router.navigate(['/portal']);
        }
        else
          notify(res.result.Notificacoes[0].Mensagem, 'error', 3000);
      },
        err => {
          notify(err, 'error', 3000);
          this.loadingVisible = false;
        }
      );
  }

  onCompanySelected(e: any) {
    this.selectedCompanyId = e.addedItems[0].Id;
  }
}
