import { Component, OnInit, ElementRef, ViewChild, AfterViewChecked, AfterViewInit, AfterContentChecked } from '@angular/core';
import { ROUTES } from '../../sidebar/sidebar.component';
import { Location } from '@angular/common';
import { LocalStorageService } from '../services/localstorage.service';
import { Router } from '@angular/router';
import { FileParameter, UploadClient, UsuarioInfoResponse, UsuarioLoginResponse } from '../proxy/ctaapi';
import { LocalFileDestinationMap } from '../enum/api.enum';
import notify from 'devextreme/ui/notify';

@Component({
    selector: 'navbar-cmp',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.css']
})

export class NavbarComponent implements OnInit, AfterViewChecked, AfterViewInit, AfterContentChecked {
    @ViewChild("fileInput") fileInput;
    private listTitles: any[];
    location: Location;
    private toggleButton: any;
    private sidebarVisible: boolean;
    loginInfo: UsuarioLoginResponse;
    NomeLogado: string;
    VooSelecionado: string;
    popupVisible: boolean = false;
    textBoxValue: string;
    curfile: File;
    arquivoErro: string;
    passwordMode: string = "password";
    passwordButton = {
        icon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAkCAYAAADhAJiYAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAB7klEQVRYw+2YP0tcQRTFz65xFVJZpBBS2O2qVSrRUkwqYfUDpBbWQu3ELt/HLRQ/Q8RCGxVJrRDEwj9sTATxZ/Hugo4zL/NmV1xhD9xi59177pl9986fVwLUSyi/tYC+oL6gbuNDYtyUpLqkaUmfJY3a+G9JZ5J2JW1J2ivMDBSxeWCfeBxYTHSOWMcRYLOAEBebxtEVQWPASQdi2jgxro4E1YDTQIJjYM18hszGbew4EHNq/kmCvgDnHtI7YBko58SWgSXg1hN/btyFBM0AlwExczG1YDZrMS4uLUeUoDmgFfjLGwXEtG05wNXyTc4NXgzMCOAIGHD8q0ATuDZrempkwGJ9+AfUQ4K+A/eEseqZ/UbgdUw4fqs5vPeW+5mgBvBAPkLd8cPju+341P7D/WAaJGCdOFQI14kr6o/zvBKZYz11L5Okv5KGA89Kzu9K0b0s5ZXt5PjuOL6TRV5ZalFP4F+rrnhZ1Cs5vN6ijmn7Q162/ThZq9+YNW3MbfvDAOed5cxdGL+RFaUPKQtjI8DVAr66/u9i6+jJzTXm+HFEVqxVYBD4SNZNKzk109HxoycPaG0bIeugVDTp4hH2qdXJDu6xOAAWiuQoQdLHhvY1aEZSVdInG7+Q9EvSz9RrUKqgV0PP3Vz7gvqCOsUj+CxC9LB1Dc8AAAASdEVYdEVYSUY6T3JpZW50YXRpb24AMYRY7O8AAAAASUVORK5CYII=",
        type: "default",
        onClick: () => {
            this.passwordMode = this.passwordMode === "text" ? "password" : "text";
        }
    };
    warningClass: string = '';
    certificateExpiresDays: number = -1;

    constructor(location: Location,
        private element: ElementRef,
        private localstorageService: LocalStorageService,
        private router: Router,
        private uploadClient: UploadClient) {
        this.location = location;
        this.sidebarVisible = false;
    }

    ngAfterViewInit(): void {
    }

    ngAfterContentChecked(): void {
        if(!this.loginInfo?.UsuarioInfo.CertificateExpiration)
            return;
        this.certificateExpiresIn();

        if (this.certificateExpiresDays < 13) {
            this.warningClass = "warning-certicate-red"
        } else if (this.certificateExpiresDays < 40) {
            this.warningClass = "warning-certicate-yellow"
        } else {
            this.warningClass = "warning-certicate-green"
        }
    }

    ngAfterViewChecked(): void {
    }

    ngOnInit() {
        this.listTitles = ROUTES.filter(listTitle => listTitle.location == 'sidebar');
        const navbar: HTMLElement = this.element.nativeElement;
        this.toggleButton = navbar.getElementsByClassName('navbar-toggle')[0];
        this.loginInfo = this.localstorageService.getLocalStore();
        if (this.loginInfo?.UsuarioInfo) {
            this.NomeLogado = this.loginInfo.UsuarioInfo.Nome + ' ' + this.loginInfo.UsuarioInfo.Sobrenome;
        }
    }


    sidebarOpen() {
        const toggleButton = this.toggleButton;
        const body = document.getElementsByTagName('body')[0];
        setTimeout(function () {
            toggleButton.classList.add('toggled');
        }, 500);
        body.classList.add('nav-open');

        this.sidebarVisible = true;
    };

    sidebarClose() {
        const body = document.getElementsByTagName('body')[0];
        this.toggleButton.classList.remove('toggled');
        this.sidebarVisible = false;
        body.classList.remove('nav-open');
    };

    sidebarToggle() {
        if (this.sidebarVisible === false) {
            this.sidebarOpen();
        } else {
            this.sidebarClose();
        }
    };

    getTitle() {
        var titlee = this.location.prepareExternalUrl(this.location.path());
        if (titlee.charAt(0) === '#') {
            titlee = titlee.slice(1);
        }

        for (var item = 0; item < this.listTitles.length; item++) {
            if (this.listTitles[item].path === titlee) {
                return this.listTitles[item].title;
            }
        }
        return 'Dashboard';
    }

    logout() {
        this.localstorageService.logout();
        this.router.navigate(['/login']);
    }

    certificateExpiresIn() {
        const dateSent = new Date(this.loginInfo?.UsuarioInfo.CertificateExpiration);
        let currentDate = new Date();
        this.certificateExpiresDays = Math.floor((Date.UTC(dateSent.getFullYear(), dateSent.getMonth(), dateSent.getDate()) - Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate())) / (1000 * 60 * 60 * 24));
    }

    showUploadCertificate(e: any) {
        this.popupVisible = true;
    }

    onClickSelecionarCertificado() {
        this.fileInput.nativeElement.click();
    }

    onFilesAdded() {
        if (this.fileInput.nativeElement.files[0]) {
            var id = this.fileInput.nativeElement.files[0].name;
            var extensao = id.substr(id.length - 4).toUpperCase();
            if (extensao == '.PFX') {
                this.curfile = this.fileInput.nativeElement.files[0] ?? undefined;
                this.arquivoErro = "";
            }
            else {
                this.curfile = undefined;
                this.arquivoErro = "Apenas arquivos PFX são aceitáveis!";
            }
        }
    }

    onClickEnviarCertificado() {
        this.enviarArquivo();
        this.popupVisible = false;
    }

    enviarArquivo() {
        let fileInfo: FileParameter = {
            fileName: this.curfile.name,
            data: this.curfile
        }

        this.uploadClient.uploadCertificadoDigital(
            0,
            this.textBoxValue,
            LocalFileDestinationMap.User,
            fileInfo)
            .toPromise()
            .then((res) => {
                if (res.result.Sucesso) {
                    this.popupVisible = false;
                    this.loginInfo.UsuarioInfo.CertificateExpiration = res.result.Dados.DataVencimento;
                    this.localstorageService.storeOnLocalStorage(this.loginInfo);
                    notify(`Arquivo ${this.curfile.name} enviado com Sucesso!`, "success")
                    this.curfile = undefined;
                    this.fileInput.nativeElement.value = '';
                    this.textBoxValue = '';
                }
                else {
                    notify(res.result.Notificacoes[0].Mensagem, 'error', 3000)
                }
            })
            .catch(err => {
                notify(err, 'error', 3000)
            });

    }

}
