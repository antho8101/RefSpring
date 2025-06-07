
export const ProcessInfoSection = () => {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h4 className="font-medium text-blue-900 mb-2">Processus de facturation et suppression</h4>
      <ol className="text-sm text-blue-800 space-y-1">
        <li>1. 💳 Prélèvement automatique sur votre carte enregistrée</li>
        <li>2. 📧 Envoi des liens de paiement Stripe aux affiliés</li>
        <li>3. 💰 Transfert des commissions vers les comptes affiliés</li>
        <li>4. 🗑️ Suppression définitive de la campagne et données associées</li>
      </ol>
    </div>
  );
};
