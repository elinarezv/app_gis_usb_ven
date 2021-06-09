import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
    
export class AlertService {
  constructor(private toastController: ToastController) {}
  async presentToast(message: any, durationTime?: number) {
    if (!durationTime) {
      durationTime = 3000;
    }
    const toast = await this.toastController.create({
      message: message,
      duration: durationTime,
      position: 'bottom',
      color: 'dark'
    });
    toast.present();
  }
}
