
export const SecurityInfoSection = () => {
  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
      <h4 className="font-medium text-green-900 mb-2">🔒 Sécurité Anti-Fraude :</h4>
      <ul className="text-sm text-green-800 space-y-1 list-disc list-inside">
        <li><strong>Premier clic gagne :</strong> Le premier affilié qui amène le visiteur obtient le crédit</li>
        <li><strong>Attribution automatique :</strong> Pas besoin de spécifier l'affilié dans le code de conversion</li>
        <li><strong>Impossible de voler des conversions :</strong> Les clics ultérieurs n'écrasent pas l'attribution</li>
        <li><strong>Un clic par affilié par session :</strong> Protection contre le spam de clics</li>
      </ul>
    </div>
  );
};
