import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

@Component({
  selector: 'page-contact',
  templateUrl: 'contact.html'
})
export class ContactPage {

  modules = [
    { name: 'Product Intelligence', enabled: true, budget: '120 EUR/mois', approval: 'Brief valide par client' },
    { name: 'Market Research', enabled: true, budget: '220 EUR/mois', approval: 'Sources citees obligatoires' },
    { name: 'Campaign Builder', enabled: true, budget: '300 EUR/mois', approval: 'Validation avant publication' },
    { name: 'Sales Playbook', enabled: false, budget: '180 EUR/mois', approval: 'Validation manager sales' },
    { name: 'MCP Integrations', enabled: false, budget: 'Selon connecteurs', approval: 'OAuth et permissions par outil' }
  ];

  toolChoices = [
    { area: 'Application', choice: 'Ionic/Angular maintenant, migration Next.js recommandee pour le SaaS final' },
    { area: 'Base de donnees', choice: 'PostgreSQL avec pgvector pour memoire et recherche semantique' },
    { area: 'Jobs agents', choice: 'BullMQ ou workflow durable pour taches longues et reprises' },
    { area: 'Stockage assets', choice: 'S3 compatible, Cloudflare R2 ou stockage objet economique' },
    { area: 'Observabilite', choice: 'OpenTelemetry, Grafana et journal des couts par appel modele' }
  ];

  constructor(public navCtrl: NavController) {

  }

}
