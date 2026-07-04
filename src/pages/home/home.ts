import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  missionMetrics = [
    { label: 'Objectif revenu', value: '120 kEUR', detail: 'pipeline cible trimestriel' },
    { label: 'Budget IA', value: '1 850 EUR', detail: 'plafond mensuel controle' },
    { label: 'Decisions client', value: '7', detail: 'validations requises' },
    { label: 'Artefacts', value: '42', detail: 'assets organises' }
  ];

  agents = [
    {
      name: 'Orchestrateur principal',
      role: 'Coordonne la mission, assigne les taches et garde le client dans la boucle.',
      model: 'Raisonnement premium',
      cost: '0,42 EUR',
      status: 'Planifie'
    },
    {
      name: 'Agent decouverte produit',
      role: 'Questionne le souscripteur, lit les documents et formalise la proposition de valeur.',
      model: 'Modele intermediaire',
      cost: '0,08 EUR',
      status: 'En collecte'
    },
    {
      name: 'Agent marche',
      role: 'Analyse segments, concurrents, tendances et objections commerciales.',
      model: 'Modele recherche',
      cost: '0,16 EUR',
      status: 'Analyse'
    },
    {
      name: 'Agent campagne',
      role: 'Produit messages, canaux, budget et calendrier d execution.',
      model: 'Modele creatif economique',
      cost: '0,05 EUR',
      status: 'Pret'
    }
  ];

  workflow = [
    'Comprendre le produit ou service',
    'Demander les donnees manquantes au client',
    'Organiser les documents dans le Data Hub',
    'Generer personas, marche, campagnes et budget',
    'Soumettre les decisions sensibles au client',
    'Executer puis mesurer les resultats'
  ];

  artifacts = [
    { title: 'Brief produit consolide', type: 'Knowledge base', owner: 'Agent decouverte' },
    { title: 'Carte des segments cibles', type: 'Market intelligence', owner: 'Agent marche' },
    { title: 'Plan campagne 30 jours', type: 'Go-to-market', owner: 'Agent campagne' },
    { title: 'Registre des validations', type: 'Audit trail', owner: 'Orchestrateur' }
  ];

  constructor(public navCtrl: NavController) {

  }

}
