export class UldMasterBaseDto {

    constructor() { }

    public MasterNumero: string;
    public UldId: string;
    public UldCaracteristicaCodigo: string;
    public UldIdPrimario: string;
    public QuantidadePecas: number;
    public Peso: number;
}

export class UldMasterResponseDto extends UldMasterBaseDto {

    public Id: number;
    public MasterId: number;
    public PesoUnidade: string;
    public PesoMesmoVoo: number;
    public PesoOutroVoo: number;
    public UsuarioCriacao: string;
    public DateTime?: Date;
}

export class UldMasterInsertRequest extends UldMasterBaseDto {
    public UsuarioId: number;
    public VooId: number;
    public EmpresaId: number;
}

export class UldMasterUpdateRequest extends UldMasterBaseDto {
    public Id: number;
    public UsuarioId: number;
    public VooId: number;
}

export class ListaUldMasterRequest {
    public vooId: number;
    public uldLinha: string;
}

export class UldMasterNumeroQuery {

    constructor() { }

    public ULDCaracteristicaCodigo: string;
    public ULDId: string;
    public ULDIdPrimario: string;
    public ULDLinha: string;
    public ULDs: Array<UldMasterResponseDto>;
}

export class MasterNumeroUldSumario {
    public MasterNumero: string
    public MasterPecas?: number
    public UldMasterPecasSoma?: number
    public MasterPeso?: number
    public UldMasterPesoSoma?: number
    public PesoUnidade: string
    public TotalParcial: string
}

export class UldMasterDeleteByTagInput {
    public VooId: number
    public ULDId: string
    public ULDCaracteristicaCodigo: string
    public ULDIdPrimario: string
}

export class UldMasterDeleteByIdInput {
    public VooId: number
    public ListaIds: Array<number>
}