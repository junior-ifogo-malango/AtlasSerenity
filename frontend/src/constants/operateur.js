// Constantes partagées entre Register.jsx, ValidationAdmin.jsx et VerificationOperateur.jsx.
// Les libellés sont des clés i18n (à résoudre via t()), pas du texte brut.

export const TYPES_REQUIS = {
  guide: ["certificat_guide", "assurance"],
  entreprise: ["registre_commerce", "assurance"],
}

export const TYPES_OPERATEUR = [
  { value: "guide", labelKey: "operateur.types.guide" },
  { value: "entreprise", labelKey: "operateur.types.entreprise" },
]

export const LABELS_DOCUMENT = {
  certificat_guide: "operateur.documents.certificatGuide",
  assurance: "operateur.documents.assurance",
  registre_commerce: "operateur.documents.registreCommerce",
  autre: "operateur.documents.autre",
}

export const STATUT_DOCUMENT_CLASSNAMES = {
  en_attente: "border border-ocre/30 bg-ocre/15 text-ink",
  valide: "bg-cedre/10 text-cedre",
  refuse: "bg-argile/10 text-argile",
}

// L'admin et l'opérateur voient un libellé différent pour "en_attente"
// (contexte de revue vs contexte d'attente) — d'où deux jeux de clés distincts.
export const STATUTS_DOCUMENT_LABEL_KEYS_ADMIN = {
  en_attente: "operateur.documentStatus.pendingAdmin",
  valide: "operateur.documentStatus.approved",
  refuse: "operateur.documentStatus.rejected",
}

export const STATUTS_DOCUMENT_LABEL_KEYS_OPERATEUR = {
  en_attente: "operateur.documentStatus.pendingOperator",
  valide: "operateur.documentStatus.approved",
  refuse: "operateur.documentStatus.rejected",
}

export const STATUT_COMPTE_CLASSNAMES = {
  en_attente: "border border-ocre/30 bg-ocre/15 text-ink",
  valide: "bg-cedre/10 text-cedre",
  refuse: "bg-argile/10 text-argile",
}

export const STATUTS_COMPTE_LABEL_KEYS = {
  en_attente: "operateur.accountStatus.pending",
  valide: "operateur.accountStatus.approved",
  refuse: "operateur.accountStatus.rejected",
}
