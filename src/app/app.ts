import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('Portafolio_Web_DJ');
}

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);