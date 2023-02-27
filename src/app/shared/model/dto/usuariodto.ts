export class UsuarioInsertDto {

    constructor(
        public EmpresaId: number,
        public Nome: string,
        public Sobrenome: string,
        public Email: string,
        public CompanhiaId: number,
        public AlteraCompanhia: boolean,
        public AcessoUsuarios: boolean,
        public AcessoClientes: boolean,
        public AcessoCompanhias: boolean,
        public UsuarioInsercaoId: number
    ) {

    }
    public CertificadoDigitalId?:number;
}

export class UsuarioUpdateDto {

    constructor(
        public UsuarioId: number,
        public Nome: string,
        public Sobrenome: string,
        public CompanhiaId: number,
        public AlteraCompanhia: boolean,
        public AcessoUsuarios: boolean,
        public AcessoClientes: boolean,
        public AcessoCompanhias: boolean,
        public Bloqueado: boolean,
        public UsuarioModificadorId: number
    ) {

    }
    public CertificadoDigitalId?:number;
}

export class UsuarioResponseDto {

    constructor(
        public UsuarioId: number,
        public Nome: string,
        public Sobrenome: string,
        public Email: string,
        public CompanhiaId: number,
        public CompanhiaNome: string,
        public AlteraCompanhia: boolean,
        public AcessoUsuarios: boolean,
        public AcessoClientes: boolean,
        public AcessoCompanhias: boolean,
        public DataCriacao: Date,
        public Bloqueado: boolean
    ) {
        this.AlteraCompanhia = false;
        this.AcessoClientes = false;
        this.AcessoCompanhias = false;
        this.AcessoUsuarios = false;
    }
    public CertificadoDigitalId?:number;
}

export class UsuarioResetDto {

    constructor(
        public UsuarioId: number
    ) {

    }
}