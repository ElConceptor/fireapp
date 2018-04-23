import { FirebaseServices2Provider } from './../../providers/firebase-services2/firebase-services2';
import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
//import { FirebaseListObservable } from 'angularfire2/database';
//import {  AngularFireList } from "angularfire2/database";
import { Observable } from 'rxjs/Observable';
//import { AngularFireList } from 'angularfire2';
//
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  gardeList : Observable<any[]>;
  //gardeList FirebaseListObservable<any[]>;

// items : AngularFireList <any[]> ;
  //  public gardeItems : Observable <any[]> ;

  public  newGarde = '';

  constructor(public navCtrl: NavController , public FirebaseService : FirebaseServices2Provider) {
  //this.gardeItems = this.FirebaseService.getGardeList();

}
ionViewDidLoad(){
this.gardeList = this.FirebaseService.getGardeList().valueChanges();
console.log("gardelist assigned" + this.gardeList);
}
S
  addGardes()
  {
    this.FirebaseService.addGarde(this.newGarde);
  }

  acceptDemande()
  {
    this.FirebaseService.acceptDemande(this.newGarde);
  }

}
