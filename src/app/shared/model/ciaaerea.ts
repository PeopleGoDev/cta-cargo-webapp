export class CiaAerea {

    constructor(
        public CiaId: number,
        public Nome: string,
        public CNPJ: string,
        public Endereco1: string,
        public Cidade: string,
        public Estado: string,
        public Pais: string,
        public Numero: string,
        public Endereco2?: string,
        public ArquivoCertificado?: string,
        public VencimentoCertificado?: Date
    ) {

    }
}