/**
 * Assemble un fichier .ico à partir d'images PNG (format ICO avec PNG incorporés, pris en charge par tous les navigateurs
 * actuels). Fonction pure : le dépôt ne contient aucun fichier .ico, il est produit à la demande par `/favicon.ico`.
 */
export function buildIco(images: { size: number; png: Uint8Array }[]): Uint8Array {
  const count = images.length;
  const headerSize = 6 + 16 * count;
  const total = headerSize + images.reduce((n, i) => n + i.png.length, 0);
  const out = new Uint8Array(total);
  const view = new DataView(out.buffer);
  view.setUint16(0, 0, true); // réservé
  view.setUint16(2, 1, true); // type : icône
  view.setUint16(4, count, true);
  let offset = headerSize;
  images.forEach((img, i) => {
    const e = 6 + 16 * i;
    out[e] = img.size >= 256 ? 0 : img.size; // largeur (0 = 256)
    out[e + 1] = img.size >= 256 ? 0 : img.size; // hauteur
    out[e + 2] = 0; // palette
    out[e + 3] = 0; // réservé
    view.setUint16(e + 4, 1, true); // plans
    view.setUint16(e + 6, 32, true); // bits par pixel
    view.setUint32(e + 8, img.png.length, true);
    view.setUint32(e + 12, offset, true);
    out.set(img.png, offset);
    offset += img.png.length;
  });
  return out;
}
