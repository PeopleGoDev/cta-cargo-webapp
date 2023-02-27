import { Injectable, NgModule } from "@angular/core";
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from "rxjs";
import { catchError, tap } from 'rxjs/operators';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { LocalStorageService } from "app/shared/services/localstorage.service";
import { Router } from "@angular/router";
import { NgxSpinnerService } from "ngx-spinner";

@Injectable()

export class HttpsRequestInterceptor implements HttpInterceptor {

    private token: string;

    constructor(private localstorageService: LocalStorageService,
        private spinner: NgxSpinnerService,
        private router: Router) { }

    intercept(req: HttpRequest<any>, next: HttpHandler,): Observable<HttpEvent<any>> {
        const dupReq = req.clone({
            headers: req.headers.set('Authorization', `Bearer ${this.localstorageService.getLocalStore()?.AccessToken}`),
        });

        return next
            .handle(dupReq)
            .pipe(
                tap(event => {
                    if (event instanceof HttpResponse) {
                        this.spinner.hide('spinner_orange');
                    } else {
                        this.spinner.show('spinner_orange');
                    }
                }),
            )
            .pipe(
                catchError((error) => {
                    this.spinner.hide('spinner_orange');
                    console.log('error is intercept')
                    console.error(error);
                    if (error.status && error.status == "401") {
                        this.localstorageService.logout();
                        this.router.navigate(['/login']);
                    } else {

                    }
                    return throwError(error.message);
                })
            )
    }
}

@NgModule({
    providers: [
        {
            provide: HTTP_INTERCEPTORS,
            useClass: HttpsRequestInterceptor,
            multi: true,
        },
    ],
})

export class Interceptor { }