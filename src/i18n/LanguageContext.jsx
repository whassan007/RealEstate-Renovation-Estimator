import React, { createContext, useState, useContext } from 'react';

const translations = {
  en: {
    // Navigation
    nav_homeowner: "Homeowner Flow",
    nav_contractor: "Contractor Portal",
    
    // Homeowner Flow
    search_placeholder: "Enter neighborhood, zip, or city...",
    search_button: "Search",
    no_properties: "Search to discover local properties",
    beds: "beds",
    baths: "baths",
    sqft: "sqft",
    get_estimate: "Get Renovation Estimate",
    custom_location: "Custom Selected Location",
    searching: "Searching",
    property_intelligence: "Property Intelligence",
    est_area: "Estimated area",
    building_type: "Building type",
    single_family: "Single Family",
    quote_requested: "Quote Requested",
    back_to_search: "Back to Search",
    adaptive_walkthrough: "Adaptive Walkthrough",
    renovation_estimate: "Renovation Intelligence Estimate",
    initializing_agents: "Initializing Construction Agents",
    estimated_range: "Estimated Range",
    quality: "Quality",
    confidence: "Confidence",
    cost_drivers: "Major Cost Drivers",
    assumptions: "Assumptions",
    
    // Walkthrough
    step_kitchen: "Kitchen Renovation",
    kitchen_desc: "Are you planning a kitchen remodel?",
    step_bathroom: "Bathroom Remodel",
    bathroom_desc: "Are you updating the bathrooms?",
    step_bathroom_scope: "What are you changing in the Bathroom?",
    step_kitchen_scope: "What are you changing in the Kitchen?",
    step_layout_change: "Are you moving plumbing or changing the layout?",
    step_quality: "Scenario Modeling: Quality Level",
    quality_desc: "Changes actual materials (e.g. Laminate vs Quartz vs Natural Stone)",
    quality_budget: "Budget (Laminate/Basic)",
    quality_standard: "Standard (Quartz)",
    quality_premium: "Premium (Natural Stone/Custom)",
    everything: "Everything",
    fixtures_only: "Fixtures only",
    shower_tub: "Shower/tub",
    cosmetic_update: "Cosmetic update",
    keep_appliances: "Keep appliances",
    cosmetic_only: "Cosmetic only",
    btn_no: "No",
    not_sure: "Not sure",
    step_basement: "Basement Finishing",
    basement_desc: "Are you finishing the basement?",
    step_roof: "Roof Replacement",
    roof_desc: "Does the roof need to be replaced?",
    btn_skip: "Skip",
    btn_yes: "Yes",
    btn_finish: "Finish & Calculate",
    
    // Navigation Sidebar
    nav_search: "Search",
    nav_updates: "Updates",
    nav_saved: "Saved",
    nav_plan: "Plan",
    nav_inbox: "Inbox",
    
    // Estimate Results
    calculating: "Calculating deterministic cost estimate...",
    total_estimate: "Total Estimated Cost",
    view_details: "View Contractor Details",
    
    // Contractor Dashboard
    contractor_title: "Contractor Workbench",
    contractor_subtitle: "Manage estimates, markups, and client approvals",
    quote_requests: "Quote Requests",
    estimate_workspace: "Estimate Workspace",
    client: "Client",
    project: "Project",
    scope: "Scope",
    status: "Status",
    cost: "Cost",
    margin: "Margin",
    quote: "Quote",
    adjust_margin: "Adjust Margin %",
    approve_quote: "Approve Quote",
    save_changes: "Save Changes",
    admin_cost_browser: 'Cost Transparency Browser',
    nav_admin: 'Admin Costs',
    inventory_assemblies: 'Reconstruction Assemblies',
    parts_breakdown: 'Parts & Materials Breakdown',
    install_breakdown: 'Installation & Labor Breakdown',
    loading_inventory: 'Loading Inventory...',
    select_inventory_item: 'Select an assembly to view its exact cost breakdown.'
  },
  fr: {
    // Navigation
    nav_homeowner: "Flux Propriétaire",
    nav_contractor: "Portail Entrepreneur",
    
    // Homeowner Flow
    search_placeholder: "Entrez le quartier, code postal, ou ville...",
    search_button: "Rechercher",
    no_properties: "Recherchez pour découvrir les propriétés",
    beds: "chambres",
    baths: "sdb",
    sqft: "pi²",
    get_estimate: "Obtenir une Estimation",
    custom_location: "Emplacement Sélectionné",
    searching: "Recherche en cours",
    property_intelligence: "Intelligence Immobilière",
    est_area: "Superficie estimée",
    building_type: "Type de bâtiment",
    single_family: "Maison Unifamiliale",
    quote_requested: "Devis Demandé",
    back_to_search: "Retour à la recherche",
    adaptive_walkthrough: "Questionnaire Adaptatif",
    renovation_estimate: "Estimation d'Intelligence de Rénovation",
    initializing_agents: "Initialisation des Agents de Construction",
    estimated_range: "Plage Estimée",
    quality: "Qualité",
    confidence: "Confiance",
    cost_drivers: "Principaux Facteurs de Coût",
    assumptions: "Hypothèses",
    
    // Walkthrough
    step_kitchen: "Rénovation de Cuisine",
    kitchen_desc: "Prévoyez-vous refaire la cuisine?",
    step_bathroom: "Rénovation de Salle de Bain",
    bathroom_desc: "Allez-vous moderniser les salles de bain?",
    step_bathroom_scope: "Que changez-vous dans la Salle de Bain?",
    step_kitchen_scope: "Que changez-vous dans la Cuisine?",
    step_layout_change: "Déplacez-vous la plomberie ou modifiez-vous l'aménagement?",
    step_quality: "Modélisation de Scénario : Niveau de Qualité",
    quality_desc: "Modifie les matériaux réels (ex. Stratifié vs Quartz vs Pierre naturelle)",
    quality_budget: "Économique (Stratifié/De base)",
    quality_standard: "Standard (Quartz)",
    quality_premium: "Premium (Pierre naturelle/Sur mesure)",
    everything: "Tout",
    fixtures_only: "Appareils seulement",
    shower_tub: "Douche/baignoire",
    cosmetic_update: "Mise à jour cosmétique",
    keep_appliances: "Garder les électroménagers",
    cosmetic_only: "Cosmétique seulement",
    btn_no: "Non",
    not_sure: "Pas sûr",
    step_basement: "Finition de Sous-sol",
    basement_desc: "Allez-vous aménager le sous-sol?",
    step_roof: "Remplacement de Toiture",
    roof_desc: "Faut-il remplacer la toiture?",
    btn_skip: "Passer",
    btn_yes: "Oui",
    btn_finish: "Terminer & Calculer",
    
    // Navigation Sidebar
    nav_search: "Chercher",
    nav_updates: "Mises à jour",
    nav_saved: "Sauvegardés",
    nav_plan: "Plan",
    nav_inbox: "Boîte",
    
    // Estimate Results
    calculating: "Calcul de l'estimation des coûts...",
    total_estimate: "Coût Total Estimé",
    view_details: "Voir les Détails de l'Entrepreneur",
    
    // Contractor Dashboard
    contractor_title: "Espace Entrepreneur",
    contractor_subtitle: "Gérez les devis, marges, et approbations",
    quote_requests: "Demandes de Devis",
    estimate_workspace: "Espace de Devis",
    client: "Client",
    project: "Projet",
    scope: "Étendue",
    status: "Statut",
    cost: "Coût",
    margin: "Marge",
    quote: "Devis",
    adjust_margin: "Ajuster la Marge %",
    approve_quote: "Approuver le Devis",
    save_changes: "Enregistrer",
    admin_cost_browser: 'Navigateur de Transparence des Coûts',
    nav_admin: 'Coûts Admin',
    inventory_assemblies: 'Assemblages de Reconstruction',
    parts_breakdown: 'Répartition des Pièces et Matériaux',
    install_breakdown: 'Répartition de l\'Installation et de la Main-d\'œuvre',
    loading_inventory: 'Chargement de l\'Inventaire...',
    select_inventory_item: 'Sélectionnez un assemblage pour afficher sa répartition exacte des coûts.'
  }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState('en'); // Default to English
  
  const t = (key) => {
    return translations[lang][key] || key;
  };
  
  const toggleLanguage = () => {
    setLang(prev => prev === 'en' ? 'fr' : 'en');
  };

  return (
    <LanguageContext.Provider value={{ lang, t, toggleLanguage, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
