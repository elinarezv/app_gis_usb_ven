import { FormControl, ValidationErrors } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { resolve } from 'url';


@Injectable({ providedIn: 'root' })
export class UsernameValidator {
    public userTaken: boolean;
    debouncer: any;
    constructor(private authService: AuthService) {
        this.userTaken = false;
    }
    verifyEmail(control: FormControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> {
        clearTimeout(this.debouncer);
        return new Promise(resolve => {
            this.debouncer = setTimeout(
                () => {
                    console.log(control.value);
                    this.authService.verifyUsername(control.value)
                        .subscribe(
                            res => {
                                console.log(res);
                                if (res) {
                                    this.userTaken = false;
                                    resolve(null);
                                }
                            },
                            err => {
                                this.userTaken = true;
                                console.log('err' + err);
                            });
                }, 1000);
        });
    }
    static checkUsername(control: FormControl): any {
        return new Promise(resolve => {
            //Fake a slow response from server
            setTimeout(() => {
                if (control.value.toLowerCase() === "greg") {
                    resolve({
                        "username taken": true
                    });
                } else {
                    resolve(null);
                }
            }, 2000);
        });
    }
}