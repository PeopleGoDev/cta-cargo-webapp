export class Result<T> {
    constructor(
        public Sucesso?: boolean,
        public Dados?: T,
        public Notificacoes?: Array<Notificacao>
    ) {
    }
}

export class Notificacao {
    constructor(
        public Codigo?: string,
        public Mensagem?: string,
    ) {}
}