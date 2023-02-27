export class LoginInput {

    public AlterarSenhar: Boolean;
    public NovaSenha: string;
    public NovaSenhaConfirmacao: string;
    constructor(
        public Email: string,
        public Senha: string,
        
    ) {

    }
}