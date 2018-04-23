import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';

import { AboutPage } from '../pages/about/about';
import { ContactPage } from '../pages/contact/contact';
import { HomePage } from '../pages/home/home';
import { TabsPage } from '../pages/tabs/tabs';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { HttpModule } from '@angular/http';
import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule } from 'angularfire2/database';

import { FirebaseServices2Provider } from '../providers/firebase-services2/firebase-services2';
//import { FirebaseService } from './../providers/firebase-service';


const firebaseConfig = {
  apiKey: "AIzaSyABDKKroNVOpUEVkMVCgpl4QcoV4AFdezE",
   authDomain: "master-ad05d.firebaseapp.com",
   databaseURL: "https://master-ad05d.firebaseio.com",
   projectId: "master-ad05d",
   storageBucket: "master-ad05d.appspot.com",
   messagingSenderId: "1094922933743"
  }


@NgModule({
  declarations: [
    MyApp,
    AboutPage,
    ContactPage,
    HomePage,
    TabsPage
  ],
  imports: [
    BrowserModule,
    HttpModule,
    AngularFireDatabaseModule,
    AngularFireModule.initializeApp(firebaseConfig),
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    AboutPage,
    ContactPage,
    HomePage,
    TabsPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    FirebaseServices2Provider
    //,    FirebaseService
  ]
})
export class AppModule {}
