import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
/*
  Generated class for the FirebaseServices2Provider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class FirebaseServices2Provider {


    constructor( public afd : AngularFireDatabase) {
      console.log('Hello FirebaseServiceProvider Provider');
    }


    getGardeList ()
    {
       console.log('getgardelist called in provider');
        return  this.afd.list('/gardeList');

    }
    addGarde (changeRequest)
    {
      this.afd.list('/gardeList/').push({ 'title' :  changeRequest });
    //  console.log('change request called now : ' + this.afd.list('/gardeList/').length);

    }
    acceptDemande (changeRequest)
    {
      this.afd.list('/gardeList/').push(changeRequest);
      this.afd.list('/gardechange/').remove(changeRequest.id)
    }

}
