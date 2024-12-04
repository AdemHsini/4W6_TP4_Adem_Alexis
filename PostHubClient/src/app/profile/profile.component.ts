import { Component, ElementRef, ViewChild } from '@angular/core';
import { UserService } from '../services/user.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {
  userIsConnected : boolean = false;

  // Vous êtes obligés d'utiliser ces trois propriétés
  oldPassword : string = "";
  newPassword : string = "";
  newPasswordConfirm : string = "";

  username : string | null = null;
  imageUrl: string = '';

  @ViewChild("photo", {static : false}) myPicture ?: ElementRef;

  constructor(public userService : UserService) { }

  ngOnInit() {
    this.userIsConnected = localStorage.getItem("token") != null;
    this.username = localStorage.getItem("username");
  }

  async updateUser(){

    let formData = new FormData();

    if(this.myPicture != null) {
      let file = this.myPicture.nativeElement.files[0];
      if(file == null) return;
  
      let count = 0;
      while(file != null){
        formData.append("image" + count, file);
        count++;
        file = this.myPicture.nativeElement.files[count];
      }
    }

    await this.userService;
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0]; // Récupère le premier fichier sélectionné
    if (file) {
      const reader = new FileReader();

      reader.onload = () => {
        // Convertir l'image en Data URL et mettre à jour l'URL de l'image
        this.imageUrl = reader.result as string;
      };

      // Lire le fichier comme Data URL
      reader.readAsDataURL(file);
    }
  }
}
