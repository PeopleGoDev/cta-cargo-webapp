export class PortoIATAResponseDto {
    public PortoId: number
    public Codigo: string
    public Nome: string
}

export class PortoIATAInsertRequestDto {
    public Codigo: string
    public Nome: string
    public UsuarioInsercaoId: number
    public EmpresaId: number
}

export class PortoIATAUpdateRequestDto {
    public PortoIATAId: number
    public Nome: string
    public UsuarioModificadorId: number
}