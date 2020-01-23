import { FormControl } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { Injectable } from '@angular/core';
import { resolve } from 'url';

@Injectable()
export class UsernameValidator {
    constructor(private authService: AuthService) { }
    verifyEmail(control: FormControl): any {
        return this.authService.login(control.value, ' ').subscribe(
            data => {
                ;
            },
            error => {

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