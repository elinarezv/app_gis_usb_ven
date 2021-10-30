import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { EnvService } from './env.service';
import { User } from '../models/user';


@Injectable({
  providedIn: 'root',
})

export class AuthService {
  isLoggedIn = false;
  token: any;
  userFirstName: string;
  userLastName: string;
  userEmail: string;
  userAddress: string;

  constructor(private http: HttpClient, private storage: NativeStorage, private env: EnvService) {}
  isLogged() {
    return this.isLoggedIn;
  }
  getTokenStr() {
    return this.token;
  }
  setToken(newToken: any) {
    this.token = newToken;
  }
  login(email: string, password: string){
    return this.http.post(this.env.API_URL + 'auth/login', { email: email, password: password }).pipe(
      tap((token) => {
        console.log(token);
        this.storage.setItem('token', token).then(
          () => {
            console.log('Token Stored');
          },
          (error) => console.error('Error storing token', error)
        );
        this.token = token;
        this.isLoggedIn = true;
        return token;
      })
    );
  }
  register(email: string, password: string, notifications: string) {
    const body = new HttpParams().set('email', email).set('password', password).set('notifications', notifications);
    return this.http.post(this.env.API_URL + 'auth/register', body.toString(), {
      headers: new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded'),
    });
  }
  recover(email: string) {
    return this.http.get(this.env.API_URL + 'account/recover', {
      params: new HttpParams().set('userEmail', email),
    });
  }
  update(fName: string, lName: string, addr: string) {
    const headers = new HttpHeaders({
      Authorization: 'Basic' + ' ' + this.token,
      'x-access-token': this.token.token,
      'Content-type': 'application/x-www-form-urlencoded',
    });
    const body = new HttpParams().set('fName', fName).set('lName', lName).set('addr', addr);
    return this.http.post(this.env.API_URL + 'auth/userUpdate', body.toString(), {
      headers: headers,
    });
  }
  verifyUsername(userEmail: string) {
    console.log('User: ' + userEmail);
    return this.http
      .get(this.env.API_URL + 'auth/userNameValidation', {
        params: new HttpParams().set('email', userEmail),
      })
      .pipe(
        tap((data) => {
          return data;
        })
      );
  }
  logout() {
    const headers = new HttpHeaders({
      Authorization: 'Basic' + ' ' + this.token,
      'x-access-token': this.token.token,
    });
    return this.http.get(this.env.API_URL + 'auth/logout', { headers: headers }).pipe(
      tap((data) => {
        this.storage.remove('token');
        this.isLoggedIn = false;
        delete this.token;
        return data;
      })
    );
  }
  user() {
    const headers = new HttpHeaders({
      Authorization: this.token['token_type'] + ' ' + this.token['access_token'],
    });
    return this.http
      .get<User>(this.env.API_URL + 'auth/user', { headers: headers })
      .pipe(
        tap((user) => {
          return user;
        })
      );
  }
  getToken() {
    return this.storage.getItem('token').then(
      (data) => {
        this.token = data;
        if (this.token != null) {
          this.isLoggedIn = true;
        } else {
          this.isLoggedIn = false;
        }
      },
      (error) => {
        this.token = null;
        this.isLoggedIn = false;
      }
    );
  }
}
