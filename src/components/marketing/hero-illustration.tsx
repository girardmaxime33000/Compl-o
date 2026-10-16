/**
 * Illustration du hero : un quartier (maisons, immeuble), un repère de localisation portant le logo Compléo et une
 * personne qui se rend chez un voisin avec sa caisse à outils. Décorative (aucun texte, `aria-hidden`) : le sens de la page
 * est porté par le titre et la carte d'estimation. Dessinée en SVG pour la charte (bleu #2563eb, bleu nuit #1e3a8a, vert du titre).
 */
export function HeroIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 640 520" className={className} aria-hidden="true" focusable="false">
      <ellipse cx="335" cy="250" rx="300" ry="238" fill="#e9f1ff"/>
      <circle cx="104" cy="410" r="112" fill="#dcfce7"/>
      <circle cx="540" cy="108" r="58" fill="#fef3c7"/>
      <circle cx="540" cy="108" r="34" fill="#fde68a"/>
      <rect x="92" y="112" width="104" height="28" rx="14" fill="#ffffff" opacity=".9"/>
      <rect x="132" y="92" width="64" height="30" rx="15" fill="#ffffff" opacity=".9"/>
      <rect x="430" y="170" width="86" height="24" rx="12" fill="#ffffff" opacity=".8"/>
      <circle cx="320" cy="262" r="150" fill="none" stroke="#bcd1fb" strokeWidth="3" strokeDasharray="3 10" strokeLinecap="round" opacity="0.55"/>
      <circle cx="320" cy="262" r="104" fill="none" stroke="#bcd1fb" strokeWidth="3" strokeDasharray="3 10" strokeLinecap="round" opacity="0.8"/>
      <path d="M0 432 Q320 392 640 432 V520 H0Z" fill="#dbe7fe"/>
      <path d="M0 462 Q320 428 640 462 V520 H0Z" fill="#bcd1fb"/>
      <path d="M180 520 Q300 470 360 432 L420 432 Q372 480 330 520Z" fill="#ffffff" opacity=".75"/>
      <rect x="62" y="296" width="124" height="126" rx="8" fill="#ffffff"/>
      <polygon points="50,300 124,236 198,300" fill="#2563eb"/>
      <rect x="108" y="352" width="32" height="70" rx="5" fill="#1e3a8a"/>
      <rect x="78" y="318" width="24" height="26" rx="4" fill="#fde68a"/>
      <rect x="146" y="318" width="24" height="26" rx="4" fill="#cfe0ff"/>
      <circle cx="132" cy="388" r="2.6" fill="#fbbf24"/>
      <rect x="252" y="236" width="146" height="186" rx="8" fill="#f8fbff"/>
      <rect x="244" y="224" width="162" height="20" rx="6" fill="#1e3a8a"/>
      <rect x="268" y="262" width="26" height="26" rx="4" fill="#cfe0ff"/>
      <rect x="310" y="262" width="26" height="26" rx="4" fill="#fde68a"/>
      <rect x="352" y="262" width="26" height="26" rx="4" fill="#cfe0ff"/>
      <rect x="268" y="302" width="26" height="26" rx="4" fill="#fde68a"/>
      <rect x="310" y="302" width="26" height="26" rx="4" fill="#cfe0ff"/>
      <rect x="352" y="302" width="26" height="26" rx="4" fill="#cfe0ff"/>
      <rect x="268" y="342" width="26" height="26" rx="4" fill="#cfe0ff"/>
      <rect x="310" y="342" width="26" height="26" rx="4" fill="#cfe0ff"/>
      <rect x="352" y="342" width="26" height="26" rx="4" fill="#fde68a"/>
      <rect x="303" y="366" width="44" height="56" rx="6" fill="#2563eb"/>
      <circle cx="338" cy="396" r="2.6" fill="#ffffff"/>
      <rect x="440" y="312" width="128" height="110" rx="8" fill="#ffffff"/>
      <polygon points="428,316 504,258 580,316" fill="#16a34a"/>
      <rect x="486" y="366" width="30" height="56" rx="5" fill="#1e3a8a"/>
      <rect x="456" y="332" width="24" height="24" rx="4" fill="#cfe0ff"/>
      <rect x="526" y="332" width="24" height="24" rx="4" fill="#fde68a"/>
      <rect x="210.0" y="394.0" width="8.0" height="34.0" rx="3.0" fill="#1e3a8a" opacity=".85"/>
      <circle cx="214" cy="378.0" r="26.0" fill="#4ade80"/>
      <circle cx="202.0" cy="390.0" r="16.0" fill="#86efac" opacity=".9"/>
      <rect x="416.72" y="399.8" width="6.56" height="27.88" rx="2.46" fill="#1e3a8a" opacity=".85"/>
      <circle cx="420" cy="386.68" r="21.32" fill="#86efac"/>
      <circle cx="410.16" cy="396.52" r="13.12" fill="#4ade80" opacity=".9"/>
      <rect x="36.4" y="403.0" width="7.2" height="30.6" rx="2.7" fill="#1e3a8a" opacity=".85"/>
      <circle cx="40" cy="388.6" r="23.400000000000002" fill="#4ade80"/>
      <circle cx="29.2" cy="399.4" r="14.4" fill="#86efac" opacity=".9"/>
      <path d="M320 214 L291 158 A40 40 0 1 1 349 158Z" fill="#1e3a8a"/>
      <circle cx="320" cy="136" r="29" fill="#ffffff"/>
      <g transform="translate(299.07 116.00) scale(0.3333)" fill="none" stroke="#2563eb" strokeLinecap="round">
      <path d="M99.17 39A42 42 0 1 0 99.17 81" strokeWidth="16.43"/>
      <path d="M48.46 60H77.14M62.8 45.66V74.34" strokeWidth="10.79"/>
      </g>
      <ellipse cx="320" cy="222" rx="20" ry="5" fill="#1e3a8a" opacity=".18"/>
      <ellipse cx="502" cy="486" rx="44" ry="7" fill="#1e3a8a" opacity=".16"/>
      <rect x="481" y="436" width="15" height="46" rx="7" fill="#1e3a8a"/>
      <rect x="501" y="436" width="15" height="46" rx="7" fill="#1e3a8a"/>
      <ellipse cx="487" cy="483" rx="12" ry="6" fill="#0f172a"/>
      <ellipse cx="511" cy="483" rx="12" ry="6" fill="#0f172a"/>
      <path d="M480 384 L468 428" stroke="#15803d" strokeWidth="14" strokeLinecap="round"/>
      <circle cx="467" cy="433" r="7.5" fill="#f1c6a3"/>
      <rect x="473" y="364" width="50" height="84" rx="18" fill="#16a34a"/>
      <path d="M489 366 L498 380 L507 366" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity=".9"/>
      <path d="M516 384 L538 432" stroke="#15803d" strokeWidth="14" strokeLinecap="round"/>
      <rect x="560" y="418" width="6" height="30" rx="3" fill="#f59e0b" transform="rotate(14 563 433)"/>
      <rect x="555" y="414" width="16" height="9" rx="3" fill="#94a3b8" transform="rotate(14 563 418)"/>
      <path d="M532 444 q12 -20 24 0" stroke="#1e3a8a" strokeWidth="5" strokeLinecap="round" fill="none"/>
      <rect x="524" y="442" width="52" height="34" rx="7" fill="#2563eb"/>
      <rect x="524" y="456" width="52" height="5" fill="#1e3a8a" opacity=".35"/>
      <rect x="546" y="452" width="8" height="12" rx="2" fill="#ffffff"/>
      <circle cx="540" cy="443" r="7.5" fill="#f1c6a3"/>
      <rect x="492" y="350" width="14" height="18" rx="6" fill="#f1c6a3"/>
      <circle cx="499" cy="338" r="23" fill="#f1c6a3"/>
      <path d="M476 336 A23 23 0 0 1 522 332 Q504 322 476 336Z" fill="#1e293b"/>
      <path d="M491 344 q8 7 16 0" stroke="#1e293b" strokeWidth="2.6" strokeLinecap="round" fill="none" opacity=".75"/>
      <path d="M66 210H82M74 202V218" stroke="#2563eb" strokeWidth="4" strokeLinecap="round" opacity="0.5"/>
      <path d="M232 176H244M238 170V182" stroke="#2563eb" strokeWidth="4" strokeLinecap="round" opacity="0.45"/>
      <path d="M572 246H588M580 238V254" stroke="#2563eb" strokeWidth="4" strokeLinecap="round" opacity="0.45"/>
      <path d="M38 340H50M44 334V346" stroke="#2563eb" strokeWidth="4" strokeLinecap="round" opacity="0.4"/>
      <path d="M374 150H386M380 144V156" stroke="#2563eb" strokeWidth="4" strokeLinecap="round" opacity="0.45"/>
      <path d="M143 470H157M150 463V477" stroke="#2563eb" strokeWidth="4" strokeLinecap="round" opacity="0.45"/>
      <path d="M593 400H607M600 393V407" stroke="#2563eb" strokeWidth="4" strokeLinecap="round" opacity="0.4"/>
      <circle cx="214" cy="226" r="4" fill="#4ade80" opacity=".8"/>
      <circle cx="446" cy="214" r="5" fill="#2563eb" opacity=".35"/>
      <circle cx="60" cy="262" r="5" fill="#4ade80" opacity=".7"/>
    </svg>
  );
}
