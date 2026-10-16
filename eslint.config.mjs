import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const config = [
  ...nextVitals,
  ...nextTs,
  { ignores: [".next/**", "node_modules/**", "next-env.d.ts", "data/**"] },
  {
    rules: {
      "react/no-unescaped-entities": "off",
      // Règles « React Compiler » ajoutées par eslint-config-next 16 : le compilateur n'est pas activé, et les cas signalés
      // (redirection externe via window.location, ref lue dans un gestionnaire) sont volontaires. En avertissement.
      "react-hooks/refs": "warn",
      "react-hooks/immutability": "warn",
    },
  },
];

export default config;
