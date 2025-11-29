import { ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

import { initializeApp } from "firebase/app";
import { provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
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

      provideFirebaseApp(() => initializeApp(firebaseConfig)),
      provideAuth(() => getAuth()),
      provideFirestore(() => getFirestore()),
    
  ]
};
