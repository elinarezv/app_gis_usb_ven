"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.AuthService = void 0;
var core_1 = require("@angular/core");
var http_1 = require("@angular/common/http");
var operators_1 = require("rxjs/operators");
var rxjs_1 = require("rxjs");
var AuthService = /** @class */ (function () {
    function AuthService(http, http2, storage, env) {
        this.http = http;
        this.http2 = http2;
        this.storage = storage;
        this.env = env;
        this.isLoggedIn = false;
    }
    AuthService.prototype.isLogged = function () {
        return this.isLoggedIn;
    };
    AuthService.prototype.getTokenStr = function () {
        return this.token;
    };
    AuthService.prototype.setToken = function (newToken) {
        this.token = newToken;
    };
    AuthService.prototype.login = function (email, password) {
        var _this = this;
        //this.http2.setServerTrustMode('nocheck');
        this.http2.setHeader('*', 'Access-Control-Allow-Origin', '*');
        this.http2.setHeader('*', 'Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT');
        this.http2.setHeader('*', 'Accept', 'application/json');
        this.http2.setHeader('*', 'content-type', 'application/json');
        this.http2.setDataSerializer('json');
        return rxjs_1.from(this.http2.post(this.env.API_URL + 'auth/login', { email: email, password: password }, {}).then(function (token) {
            console.log('Conectó al serve API');
            debugger;
            _this.storage.setItem('token', JSON.parse(token.data)).then(function () {
                console.log('Token Stored');
            }, function (error) { return console.error('Error storing token', error); });
            _this.token = token;
            _this.isLoggedIn = true;
            return token;
        }));
    };
    AuthService.prototype.register = function (email, password, notifications) {
        var body = new http_1.HttpParams().set('email', email).set('password', password).set('notifications', notifications);
        return this.http.post(this.env.API_URL + 'auth/register', body.toString(), {
            headers: new http_1.HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded')
        });
    };
    AuthService.prototype.recover = function (email) {
        return this.http.get(this.env.API_URL + 'account/recover', {
            params: new http_1.HttpParams().set('userEmail', email)
        });
    };
    AuthService.prototype.update = function (fName, lName, addr) {
        var headers = new http_1.HttpHeaders({
            Authorization: 'Basic' + ' ' + this.token,
            'x-access-token': this.token.token,
            'Content-type': 'application/x-www-form-urlencoded'
        });
        var body = new http_1.HttpParams().set('fName', fName).set('lName', lName).set('addr', addr);
        return this.http.post(this.env.API_URL + 'auth/userUpdate', body.toString(), {
            headers: headers
        });
    };
    AuthService.prototype.verifyUsername = function (userEmail) {
        console.log('User: ' + userEmail);
        return this.http
            .get(this.env.API_URL + 'auth/userNameValidation', {
            params: new http_1.HttpParams().set('email', userEmail)
        })
            .pipe(operators_1.tap(function (data) {
            return data;
        }));
    };
    AuthService.prototype.logout = function () {
        var _this = this;
        var headers = new http_1.HttpHeaders({
            Authorization: 'Basic' + ' ' + this.token,
            'x-access-token': this.token.token
        });
        return this.http.get(this.env.API_URL + 'auth/logout', { headers: headers }).pipe(operators_1.tap(function (data) {
            _this.storage.remove('token');
            _this.isLoggedIn = false;
            delete _this.token;
            return data;
        }));
    };
    AuthService.prototype.user = function () {
        var headers = new http_1.HttpHeaders({
            Authorization: this.token['token_type'] + ' ' + this.token['access_token']
        });
        return this.http
            .get(this.env.API_URL + 'auth/user', { headers: headers })
            .pipe(operators_1.tap(function (user) {
            return user;
        }));
    };
    AuthService.prototype.getToken = function () {
        var _this = this;
        debugger;
        return this.storage.getItem('token').then(function (data) {
            _this.token = data;
            if (_this.token != null) {
                _this.isLoggedIn = true;
            }
            else {
                _this.isLoggedIn = false;
            }
        }, function (error) {
            _this.token = null;
            _this.isLoggedIn = false;
        });
    };
    AuthService = __decorate([
        core_1.Injectable({
            providedIn: 'root'
        })
    ], AuthService);
    return AuthService;
}());
exports.AuthService = AuthService;
