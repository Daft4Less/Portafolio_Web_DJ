import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';

import { provideFirebaseApp, initializeApp } from "@angular/fire/app";
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

const firebaseConfig = {
  apiKey: "AIzaSyAwclprMFEPkD6ILl-a3o89SM3gHbpcRds",
  authDomain: "portafolioweb-b3b64.firebaseapp.com",
  projectId: "portafolioweb-b3b64",
  storageBucket: "portafolioweb-b3b64.firebasestorage.app",
  messagingSenderId: "307826675398",
  appId: "1:307826675398:web:a38879555618747bf8d1c7"
};


export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),

    //Configuración de Firebase
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
  ]
};