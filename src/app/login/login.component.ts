import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AutenticacaoService } from 'app/shared/services/autenticacao.service';
import { LocalStorageService } from 'app/shared/services/localstorage.service';
import { Observable } from 'rxjs/Rx';
import notify from 'devextreme/ui/notify';
import { LoginInput } from 'app/shared/model/logininput';
import { AccountClient, UsuarioLoginRequest } from 'app/shared/proxy/ctaapi';

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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private autenticacaoService: AutenticacaoService,
    private localstorage: LocalStorageService,
    private accountClient: AccountClient,
  ) { }

  ngOnInit(): void {

    // get return url from route parameters or default to '/'
    this.localstorage.logout();
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  onSubmit() {

    this.loadingVisible = true;
    let loginInput: UsuarioLoginRequest= {
      Email: this.usuario,
      Senha: this.senha
    }

    if (this.alterarSenha == true) {
      loginInput.AlterarSenhar = true;
      loginInput.NovaSenha = this.novasenha;
      loginInput.NovaSenhaConfirmacao = this.novasenhaconfirmacao;
    }

    this.accountClient.autenticar(loginInput)
      .subscribe(res => {
          this.loadingVisible = false;
          if (res.result.Sucesso) {
            if (res.result.Dados.AlterarSenha != undefined && res.result.Dados.AlterarSenha == true) {
              this.alterarSenha = true;
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

}
