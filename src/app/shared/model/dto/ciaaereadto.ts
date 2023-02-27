export class CiaAereaInsertDto {

    constructor(
        public EmpresaId: number,
        public Nome: string,
        public CNPJ: string,
        public Endereco1: string,
        public Endereco2: string,
        public Cidade: string,
        public Estado: string,
        public Pais: string,
        public UsuarioId: number,
        public Numero: string,
    ) { }
}

export class CiaAereaUpdateDto {
    constructor(
        public CiaId: number,
        public Nome: string,
        public CNPJ: string,
        public Endereco1: string,
        public Endereco2: string,
        public Cidade: string,
        public Estado: string,
        public Pais: string,
        public UsuarioId: number,
        public Numero: string,
    ) { }
}

export class CiaAereaResponseDto {
    constructor(
        public CiaId: number,
        public Nome: string,
        public CNPJ: string,
        public Endereco1: string,
        public Endereco2: string,
        public Cidade: string,
        public Estado: string,
        public Pais: string,
        public Numero: string,
        public ArquivoCertificado: string,
        public DataExpiracaoCertificado: Date
    ) { }
}

export class CiaAereaSimplesResponseDto {
    constructor(
        public CiaId: number,
        public Nome: string
    ) { }
}

export class CiaAereaCertificadoRequestDto {
    constructor(
        public CiaId: number,
        public UsuarioId: number,
        public Senha: string
    ) { }
}