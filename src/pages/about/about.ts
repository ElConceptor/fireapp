import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})
export class AboutPage {

  architectureLayers = [
    {
      title: 'Experience SaaS',
      description: 'Console client, missions, validations, visualisation des agents et reporting.'
    },
    {
      title: 'Orchestration agentique',
      description: 'Agent principal, sous-agents specialises, files de taches et politiques de delegation.'
    },
    {
      title: 'Data Hub',
      description: 'Documents, briefs, assets, memoire, embeddings, audit trail et couts IA.'
    },
    {
      title: 'Integrations MCP',
      description: 'Connecteurs controles vers CRM, drive, analytics, emailing et outils publicitaires.'
    }
  ];

  roadmap = [
    'MVP diagnostic produit et questionnaire client',
    'Data Hub multi-tenant avec registre des decisions',
    'Equipe d agents visible avec cout par tache',
    'Modules activables depuis la console admin',
    'Integrations MCP et connecteurs metier',
    'Optimisation continue des campagnes et budgets'
  ];

  constructor(public navCtrl: NavController) {

  }

}
