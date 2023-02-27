export class VooListarInputDto {
    public CompanhiaId?: number;
    public DataVoo?: Date;
    public DataInicial?: Date;
    public DataFinal?: Date;
}

export class VooInsertRequestDto {

    constructor(
        public EmpresaId: number,
        public Numero: string,
        public DataVoo: Date,
        public UsuarioInsercaoId: number,
        public DataHoraSaidaEstimada?: Date,
        public DataHoraSaidaReal?: Date,
        public DataHoraChegadaEstimada?: Date,
        public DataHoraChegadaReal?: Date,
        public PesoBruto?: number,
        public PesoBrutoUnidade?: string,
        public Volume?: number,
        public VolumeUnidade?: string,
        public TotalPacotes?: number,
        public TotalPecas?: number,

    ) { }

    public AeroportoOrigemCodigo: string;
    public AeroportoDestinoCodigo: string;
}

export class VooUpdateRequestDto {

    constructor(
        public VooId: number,
        public UsuarioModificadorId: number,
        public DataHoraSaidaEstimada?: Date,
        public DataHoraSaidaReal?: Date,
        public DataHoraChegadaEstimada?: Date,
        public DataHoraChegadaReal?: Date,
        public PesoBruto?: number,
        public PesoBrutoUnidade?: string,
        public Volume?: number,
        public VolumeUnidade?: string,
        public TotalPacotes?: number,
        public TotalPecas?: number,
    ) { }

    public AeroportoOrigemCodigo: string;
    public AeroportoDestinoCodigo: string;
}

export class VooResponseDto {
    public VooId: number;
    public Numero: string;
    public DataVoo: Date;
    public StatusId: number;
    public SituacaoRFBId: number;
    public AeroportoOrigemCodigo: string;
    public AeroportoDestinoCodigo: string;
    public DataHoraSaidaEstimada?: Date;
    public DataHoraSaidaReal?: Date;
    public DataHoraChegadaEstimada?: Date;
    public DataHoraChegadaReal?: Date;
    public PesoBruto?: number;
    public PesoBrutoUnidade?: string;
    public Volume?: number;
    public VolumeUnidade?: string;
    public TotalPacotes?: number;
    public TotalPecas?: number;
    public ProtocoloRFB?: string;
    public ErroCodigoRFB?: string;
    public ErroDescricaoRFB?: string;
    public DataProtocoloRFB: Date;
    public UsuarioCriacao: string;
    public DataCriacao: Date;
}

export class VooListaResponseDto {
    constructor(
        public VooId: number,
        public Numero: string,
    ) { }
}

export class VooListarListaInputDto {
    constructor(
        public CompanhiaId: number,
        public DataVoo: Date,
    ) { }
}

export class VooUploadInput {
    public UsuarioId: number;
    public VooId: number;
}