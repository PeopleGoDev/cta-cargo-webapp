export interface UsuarioLoginInfo {
    AccessToken: string
    UsuarioInfo: UsuarioInfo
    AlterarSenha: Boolean
}

export interface UsuarioInfo {
    UsuarioId: number
    EmpresaId: number
    Nome: string
    Sobrenome: string
    Email: string
    AlteraCompanhia: boolean
    AcessoUsuarios: boolean
    AcessoClientes: boolean
    AcessoCompanhias: boolean
    CompanhiaId?: number
    CompanhiaNome?: string
    DataAlteracao?: Date
    UrlFoto?: string
}