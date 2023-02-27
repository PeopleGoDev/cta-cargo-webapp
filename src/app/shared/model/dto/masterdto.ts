export class MasterBaseDto {
    public TotalParcial: string
    public NCMLista: string[]
    public RemetenteNome: string
    public RemetenteEndereco: string
    public RemetentePostal: string
    public RemetenteCidade: string
    public RemetentePaisCodigo: string
    public RemetenteSubdivisao: string
    public ConsolidadoDireto?: string
    public NumeroVooXML: string
    public AeroportoOrigemCodigo: string
    public AeroportoDestinoCodigo: string
    public NaturezaCarga: string
}

export class MasterInsertRequestDto extends MasterBaseDto {
    constructor(
        public EmpresaId: number,
        public VooId: number,
        public UsuarioInsercaoId: number,
        public Numero: string,
        public PesoTotalBruto: number,
        public PesoTotalBrutoUN: string,
        public TotalPecas: number,
        public ValorFretePP: number,
        public ValorFretePPUN: string,
        public ValorFreteFC: number,
        public ValorFreteFCUN: string,
        public IndicadorMadeiraMacica: boolean,
        public IndicadorNaoDesunitizacao: boolean,
        public DescricaoMercadoria: string,
        public CodigoRecintoAduaneiro: number,
        public RUC: string,
        public ConsignatarioNome: string,
        public ConsignatarioEndereco: string,
        public ConsignatarioPostal: string,
        public ConsignatarioCidade: string,
        public ConsignatarioPaisCodigo: string,
        public ConsignatarioSubdivisao: string,
        public ConsignatarioCNPJ: string,
        public CiaAereaId: number,
        public DataEmissaoXML?: Date
    ) {
        super();
        this.IndicadorMadeiraMacica = false;
        this.IndicadorNaoDesunitizacao = false;
    }
    public DataVoo: Date;

}

export class MasterUpdateRequestDto extends MasterBaseDto {
    constructor(
        public MasterId: number,
        public UsuarioAlteradorId: number,
        public Numero: string,
        public PesoTotalBruto: number,
        public PesoTotalBrutoUN: string,
        public TotalPecas: number,
        public ValorFretePP: number,
        public ValorFretePPUN: string,
        public ValorFreteFC: number,
        public ValorFreteFCUN: string,
        public IndicadorMadeiraMacica: boolean,
        public IndicadorNaoDesunitizacao: boolean,
        public DescricaoMercadoria: string,
        public CodigoRecintoAduaneiro: number,
        public RUC: string,
        public ConsignatarioNome: string,
        public ConsignatarioEndereco: string,
        public ConsignatarioPostal: string,
        public ConsignatarioCidade: string,
        public ConsignatarioPaisCodigo: string,
        public ConsignatarioSubdivisao: string,
        public ConsignatarioCNPJ: string,
        public DataEmissaoXML?: Date
    ) {
        super();
    }
    public NCMLista: string[];
    public RemetenteNome: string;
    public RemetenteEndereco: string;
    public RemetentePostal: string;
    public RemetenteCidade: string;
    public RemetentePaisCodigo: string;
    public RemetenteSubdivisao: string;
    public ConsolidadoDireto?: string;
    public DataVoo: Date;
}

export class MasterResponseDto extends MasterBaseDto {
    public MasterId: number
    public StatusId: number
    public Numero: string
    public PesoTotalBruto: number
    public PesoTotalBrutoUN: string
    public TotalPecas: number
    public ValorFOB: number
    public ValorFOBUN: string
    public ValorFretePP: number
    public ValorFretePPUN: string
    public ValorFreteFC: number
    public ValorFreteFCUN: string
    public IndicadorMadeiraMacica: boolean
    public IndicadorNaoDesunitizacao: boolean
    public DescricaoMercadoria: string
    public CodigoRecintoAduaneiro: number
    public RUC: string
    public ConsignatarioNome: string
    public ConsignatarioEndereco: string
    public ConsignatarioPostal: string
    public ConsignatarioCidade: string
    public ConsignatarioPaisCodigo: string
    public ConsignatarioSubdivisao: string
    public ConsignatarioCNPJ: string
    public DataEmissaoXML: Date
    public NumeroVooXML: string
    public SituacaoRFB: number
    public ProtocoloRFB: string;
    public CodigoErroRFB: string
    public DescricaoErroRFB: string
    public DataProtocoloRFB?: Date
    public UsuarioCriacao: string
    public DataCriacao: Date
    public Erros: Array<MasterErroDto>
}

export class MasterHousesDto {

    constructor(
        public Id: number,
        public Numero: string,
        public PesoTotalBruto: number,
        public PesoTotalBrutoUN: string,
        public TotalPecas: number,
        public ValorFretePP: number,
        public ValorFretePPUN: string,
        public ValorFreteFC: number,
        public ValorFreteFCUN: string,
        public DescricaoMercadoria: string,
        public ConsignatarioNome?: string,
        public ConsignatarioEndereco?: string,
        public ConsignatarioPostal?: string,
        public ConsignatarioCidade?: string,
        public ConsignatarioPaisCodigo?: string,
        public ConsignatarioSubdivisao?: string,
        public ConsignatarioCNPJ?: string,
        public Status?: string,
        public SituacaoRFB?: string,
    ) { }
}

export class MasterVooResponseDto {

    constructor(
        public Numero: string,
        public CodigoTipo: string, // ULD ou BLK
        public Peso: number,
        public PesoUnidade: string,
        public TotalPecas: number,
        public Descricao: string,
        public PortoOrigemId: number,
        public PortoDestinoId: number,
    ) { }
}

export class MasterListaResponseDto {
    constructor(
        public MasterId: number,
        public Numero: string,
    ) { }
}

export class MasterListarRequestDto {
    public CiaAereaId: number
    public VooId?: number
    public DataCriacaoInicialUnica?: Date
    public DataCriacaoFinal?: Date
    public Numero?: string
    public NomeLike?: string
    public StatusReceita?: number
    public DataEnvioReceita?: Date
    public EmpresaId?: number
}

export class MasterErroDto {
    public Erro: string
}