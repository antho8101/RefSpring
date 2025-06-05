
import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { UnifiedHeader } from "@/components/shared/UnifiedHeader";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, MessageSquare, Phone, MapPin, Clock, Send } from "lucide-react";

const ContactPage = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectToDashboard = () => {
    window.location.href = '/app';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulation d'envoi de formulaire
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast({
      title: "Message envoyé !",
      description: "Nous vous répondrons dans les plus brefs délais.",
    });

    setFormData({
      name: '',
      email: '',
      company: '',
      subject: '',
      message: ''
    });
    setIsSubmitting(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <>
      <Helmet>
        <title>Contact RefSpring - Besoin d'aide ? Contactez notre équipe</title>
        <meta name="description" content="Contactez l'équipe RefSpring pour toute question sur notre plateforme d'affiliation. Support technique, partenariats, ou simple question." />
        <link rel="canonical" href="https://refspring.com/contact" />
      </Helmet>

      <div className="min-h-screen bg-white">
        <UnifiedHeader onRedirectToDashboard={redirectToDashboard} />
        
        <div className="pt-24 pb-16">
          {/* Hero Section */}
          <section className="py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6">
                Contactez-nous
              </h1>
              <p className="text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto">
                Une question ? Un projet ? Notre équipe est là pour vous accompagner 
                dans votre réussite avec RefSpring.
              </p>
            </div>
          </section>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Informations de contact */}
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">
                    Parlons de votre projet
                  </h2>
                  <p className="text-slate-600 text-lg leading-relaxed">
                    Notre équipe d'experts est disponible pour répondre à toutes vos questions 
                    et vous accompagner dans la mise en place de vos programmes d'affiliation.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Mail className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">Email</h3>
                      <p className="text-slate-600">support@refspring.com</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <MessageSquare className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">Chat en direct</h3>
                      <p className="text-slate-600">Disponible 24h/24 sur notre plateforme</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Phone className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">Téléphone</h3>
                      <p className="text-slate-600">+33 1 23 45 67 89</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Clock className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">Horaires</h3>
                      <p className="text-slate-600">Lun-Ven : 9h-18h (CET)</p>
                    </div>
                  </div>
                </div>

                {/* FAQ rapide */}
                <div className="bg-slate-50 p-6 rounded-xl">
                  <h3 className="font-semibold text-slate-900 mb-4">Questions fréquentes</h3>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-slate-800">RefSpring est-il vraiment gratuit ?</h4>
                      <p className="text-sm text-slate-600">Oui, 0€ de frais mensuels. Nous prenons seulement 2.5% sur vos gains.</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-800">Combien de temps pour l'intégration ?</h4>
                      <p className="text-sm text-slate-600">Moins de 30 minutes avec notre API et notre documentation complète.</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-800">Support technique disponible ?</h4>
                      <p className="text-sm text-slate-600">Support 24h/24 par chat, email et téléphone pour tous nos utilisateurs.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Formulaire de contact */}
              <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-lg">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">
                  Envoyez-nous un message
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nom complet *</Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Votre nom"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="votre@email.com"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="company">Entreprise</Label>
                    <Input
                      id="company"
                      name="company"
                      type="text"
                      value={formData.company}
                      onChange={handleChange}
                      placeholder="Nom de votre entreprise"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="subject">Sujet *</Label>
                    <Input
                      id="subject"
                      name="subject"
                      type="text"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="Objet de votre message"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      required
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Décrivez votre projet ou votre question..."
                      className="mt-1 min-h-[120px]"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3"
                  >
                    {isSubmitting ? (
                      "Envoi en cours..."
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Envoyer le message
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-slate-500 text-center">
                    Nous vous répondrons sous 24h maximum. Vos données sont protégées et ne seront jamais partagées.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>

        <LandingFooter />
      </div>
    </>
  );
};

export default ContactPage;
