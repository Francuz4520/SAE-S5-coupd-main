import { Timestamp } from "firebase/firestore";

/**
 * Formate une date (Timestamp ou Date) en chaîne lisible
 * Ex: "aujourd'hui · 14:30" ou "lundi · 09:15" ou "12/05/2024 · 18:00"
 */
export const formatDate = (dateInput) => {
  if (!dateInput) return "";

  // 1. Conversion sécurisée en objet Date natif
  let date;
  if (dateInput instanceof Timestamp) {
    date = dateInput.toDate();
  } else if (dateInput instanceof Date) {
    date = dateInput;
  } else {
    // Au cas où ce soit une string ou un nombre
    date = new Date(dateInput); 
  }

  // 2. Calculs
  const now = new Date();
  const diffTime = now - date;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  // 3. Formatage de l'heure
  const optionsTime = { hour: "2-digit", minute: "2-digit" };
  const timeStr = date.toLocaleTimeString([], optionsTime);

  // 4. Logique d'affichage
  if (diffDays === 0) {
    return `aujourd'hui · ${timeStr}`;
  } else if (diffDays === 1) {
    // Petit bonus : gestion de "hier"
    return `hier · ${timeStr}`;
  } else if (diffDays < 7) {
    const days = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
    return `${days[date.getDay()]} · ${timeStr}`;
  } else {
    const optionsDate = { day: "2-digit", month: "2-digit", year: "numeric" };
    return `${date.toLocaleDateString([], optionsDate)} · ${timeStr}`;
  }
};