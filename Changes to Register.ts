*********  Register.html

            <ion-item>
                <ion-label position="floating">Nombres</ion-label>
                <ion-input formControlName="firstname" type="text"
                    [class.invalid]="!accountForm.controls.firstname.valid && (accountForm.controls.firstname.dirty || submitAttempt)">
                </ion-input>
            </ion-item>
            <ion-item
                *ngIf="!accountForm.controls.firstname.valid  && (accountForm.controls.firstname.dirty || submitAttempt)">
                <p>Por favor ingrese un nombre válido.</p>
            </ion-item>

            <ion-item>
                <ion-label position="floating">Apellidos</ion-label>
                <ion-input formControlName="lastname" type="text"
                    [class.invalid]="!accountForm.controls.lastname.valid && (accountForm.controls.lastname.dirty || submitAttempt)">
                </ion-input>
            </ion-item>
            <ion-item
                *ngIf="!accountForm.controls.lastname.valid  && (accountForm.controls.lastname.dirty || submitAttempt)">
                <p>Por favor ingrese un apellido válido.</p>
            </ion-item>

            <ion-item>
                <ion-label position="floating">Dirección</ion-label>
                <ion-textarea formControlName="address"></ion-textarea>
            </ion-item>

