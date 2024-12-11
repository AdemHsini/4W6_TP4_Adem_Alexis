import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';

const domain = "https://localhost:7216/";

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(public http: HttpClient) { }

  // S'inscrire
  async register(username: string, email: string, password: string, passwordConfirm: string): Promise<void> {

    let registerDTO = {
      username: username,
      email: email,
      password: password,
      passwordConfirm: passwordConfirm
    };

    let x = await lastValueFrom(this.http.post<any>(domain + "api/Users/Register", registerDTO));
    console.log(x);
  }

  // Se connecter
  async login(username: string, password: string): Promise<void> {

    let loginDTO = {
      username: username,
      password: password
    };

    let x = await lastValueFrom(this.http.post<any>(domain + "api/Users/Login", loginDTO));
    console.log(x);

    // N'hésitez pas à ajouter d'autres infos dans le stockage local... 
    // Cela pourrait vous aider pour la partie admin / modérateur
    localStorage.setItem("token", x.token);
    localStorage.setItem("username", x.username);
  }


  async changePassword(username: string, oldPassword: string, newPassword: string): Promise<void> {

    let changePasswordDTO = {
      username: username,
      oldPassword: oldPassword,
      newPassword: newPassword
    };

    let x = await lastValueFrom(this.http.post<any>(domain + "api/Users/ChangePassword", changePasswordDTO));
    console.log(x);
  }


  async update(dto: any, userName: string): Promise<Comment> {

    let x = await lastValueFrom(this.http.put<any>(domain + "api/Users/Update/" + userName, dto));
    console.log(x);
    return x;

  }

  async addModerator(name: string): Promise<void> {
    let x = await lastValueFrom(this.http.put<any>(domain + "api/Users/MakeModerator/" + name, null));
    console.log(x);
  }

  async getUserRole(): Promise<string> {
    let x = await lastValueFrom(this.http.get<any>(domain + "api/Users/GetUserRole"));
    console.log(x.roles[0]);
    return x.roles[0];
  }
}
