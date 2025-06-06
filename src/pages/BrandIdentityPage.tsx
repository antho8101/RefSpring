
import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { RefSpringLogo } from "@/components/RefSpringLogo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Download, Palette, Type, Square, Circle, ArrowRight } from "lucide-react";
import { toast } from "sonner";

const BrandIdentityPage = () => {
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const colors = {
    primary: {
      blue: { hex: "#4F46E5", name: "Primary Blue", rgb: "79, 70, 229" },
      purple: { hex: "#7C3AED", name: "Primary Purple", rgb: "124, 58, 237" },
      indigo: { hex: "#6366F1", name: "Indigo", rgb: "99, 102, 241" }
    },
    gradients: {
      main: "from-blue-600 to-purple-600",
      hover: "from-blue-700 to-purple-700",
      light: "from-blue-500/10 to-purple-500/10"
    },
    neutrals: {
      slate900: { hex: "#0F172A", name: "Slate 900", rgb: "15, 23, 42" },
      slate600: { hex: "#475569", name: "Slate 600", rgb: "71, 85, 105" },
      slate200: { hex: "#E2E8F0", name: "Slate 200", rgb: "226, 232, 240" },
      white: { hex: "#FFFFFF", name: "White", rgb: "255, 255, 255" }
    },
    semantic: {
      success: { hex: "#10B981", name: "Success Green", rgb: "16, 185, 129" },
      warning: { hex: "#F59E0B", name: "Warning Amber", rgb: "245, 158, 11" },
      error: { hex: "#EF4444", name: "Error Red", rgb: "239, 68, 68" }
    }
  };

  const copyColor = (hex: string, name: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    toast.success(`Couleur ${name} copiée: ${hex}`);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  const downloadLogo = (format: string) => {
    toast.success(`Logo ${format} préparé pour téléchargement`);
  };

  return (
    <>
      <Helmet>
        <title>RefSpring - Identité Graphique & Brand Guidelines</title>
        <meta name="description" content="Guide complet de l'identité visuelle RefSpring pour créer des communications cohérentes." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
        <div className="max-w-7xl mx-auto space-y-12">
          
          {/* Header */}
          <div className="text-center space-y-4">
            <RefSpringLogo width="80" height="80" className="mx-auto" />
            <h1 className="text-4xl font-bold text-slate-900">RefSpring</h1>
            <h2 className="text-2xl font-semibold text-slate-600">Identité Graphique & Brand Guidelines</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              Tous les éléments visuels de la marque RefSpring pour créer des communications cohérentes sur tous les supports.
            </p>
          </div>

          {/* Logo Variations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Square className="h-5 w-5" />
                Logo & Variations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              
              {/* Logo principal */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Logo Principal</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Logo sur fond blanc */}
                  <div className="bg-white p-8 rounded-lg border-2 border-slate-200 text-center">
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <RefSpringLogo width="40" height="40" />
                      <span className="font-bold text-2xl text-slate-900">RefSpring</span>
                    </div>
                    <p className="text-sm text-slate-500 mb-4">Logo complet - fond blanc</p>
                    <Button size="sm" variant="outline" onClick={() => downloadLogo('PNG')}>
                      <Download className="h-4 w-4 mr-2" />
                      PNG
                    </Button>
                  </div>

                  {/* Logo sur fond sombre */}
                  <div className="bg-slate-900 p-8 rounded-lg text-center">
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <RefSpringLogo width="40" height="40" />
                      <span className="font-bold text-2xl text-white">RefSpring</span>
                    </div>
                    <p className="text-sm text-slate-400 mb-4">Logo complet - fond sombre</p>
                    <Button size="sm" variant="secondary" onClick={() => downloadLogo('PNG-dark')}>
                      <Download className="h-4 w-4 mr-2" />
                      PNG
                    </Button>
                  </div>

                  {/* Symbole seul */}
                  <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-8 rounded-lg text-center">
                    <div className="flex justify-center mb-4">
                      <RefSpringLogo width="60" height="60" />
                    </div>
                    <p className="text-sm text-white mb-4">Symbole seul</p>
                    <Button size="sm" variant="secondary" onClick={() => downloadLogo('SVG')}>
                      <Download className="h-4 w-4 mr-2" />
                      SVG
                    </Button>
                  </div>
                </div>
              </div>

              {/* Tailles et espacement */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Tailles & Espacement</h3>
                <div className="bg-slate-50 p-6 rounded-lg">
                  <div className="flex items-center gap-8 justify-center">
                    <div className="text-center">
                      <RefSpringLogo width="16" height="16" />
                      <p className="text-xs text-slate-500 mt-2">16px - Minimum</p>
                    </div>
                    <div className="text-center">
                      <RefSpringLogo width="32" height="32" />
                      <p className="text-xs text-slate-500 mt-2">32px - Standard</p>
                    </div>
                    <div className="text-center">
                      <RefSpringLogo width="64" height="64" />
                      <p className="text-xs text-slate-500 mt-2">64px - Large</p>
                    </div>
                    <div className="text-center">
                      <RefSpringLogo width="128" height="128" />
                      <p className="text-xs text-slate-500 mt-2">128px - Hero</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Palette de couleurs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Palette de Couleurs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              
              {/* Couleurs primaires */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Couleurs Primaires</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(colors.primary).map(([key, color]) => (
                    <div key={key} className="space-y-2">
                      <div 
                        className="h-24 rounded-lg cursor-pointer transition-transform hover:scale-105 border-2 border-white shadow-lg"
                        style={{ backgroundColor: color.hex }}
                        onClick={() => copyColor(color.hex, color.name)}
                      ></div>
                      <div className="text-center">
                        <p className="font-medium">{color.name}</p>
                        <p className="text-sm text-slate-500">{color.hex}</p>
                        <p className="text-xs text-slate-400">RGB {color.rgb}</p>
                        {copiedColor === color.hex && (
                          <p className="text-xs text-green-600 font-medium">Copié !</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dégradés */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Dégradés</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <div className="h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg"></div>
                    <p className="text-center font-medium">Principal</p>
                    <p className="text-center text-sm text-slate-500">from-blue-600 to-purple-600</p>
                  </div>
                  <div className="space-y-2">
                    <div className="h-24 bg-gradient-to-r from-blue-700 to-purple-700 rounded-lg"></div>
                    <p className="text-center font-medium">Hover</p>
                    <p className="text-center text-sm text-slate-500">from-blue-700 to-purple-700</p>
                  </div>
                  <div className="space-y-2">
                    <div className="h-24 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-slate-200"></div>
                    <p className="text-center font-medium">Léger</p>
                    <p className="text-center text-sm text-slate-500">from-blue-500/10 to-purple-500/10</p>
                  </div>
                </div>
              </div>

              {/* Couleurs neutres */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Couleurs Neutres</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(colors.neutrals).map(([key, color]) => (
                    <div key={key} className="space-y-2">
                      <div 
                        className="h-16 rounded-lg cursor-pointer transition-transform hover:scale-105 border border-slate-200"
                        style={{ backgroundColor: color.hex }}
                        onClick={() => copyColor(color.hex, color.name)}
                      ></div>
                      <div className="text-center">
                        <p className="font-medium text-sm">{color.name}</p>
                        <p className="text-xs text-slate-500">{color.hex}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Couleurs sémantiques */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Couleurs Sémantiques</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(colors.semantic).map(([key, color]) => (
                    <div key={key} className="space-y-2">
                      <div 
                        className="h-16 rounded-lg cursor-pointer transition-transform hover:scale-105"
                        style={{ backgroundColor: color.hex }}
                        onClick={() => copyColor(color.hex, color.name)}
                      ></div>
                      <div className="text-center">
                        <p className="font-medium">{color.name}</p>
                        <p className="text-sm text-slate-500">{color.hex}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Typographie */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="h-5 w-5" />
                Typographie
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-slate-500 mb-2">Police principale : Space Grotesk</p>
                  <h1 className="text-4xl font-bold text-slate-900">RefSpring révolutionne l'affiliation</h1>
                  <p className="text-slate-500 mt-1">Heading 1 - 36px Bold</p>
                </div>
                
                <div>
                  <h2 className="text-3xl font-semibold text-slate-900">Plateforme sans frais mensuels</h2>
                  <p className="text-slate-500 mt-1">Heading 2 - 30px Semibold</p>
                </div>
                
                <div>
                  <h3 className="text-xl font-medium text-slate-900">Fonctionnalités avancées</h3>
                  <p className="text-slate-500 mt-1">Heading 3 - 20px Medium</p>
                </div>
                
                <div>
                  <p className="text-base text-slate-600">Nous gagnons seulement quand vous gagnez. Un modèle transparent et équitable pour tous.</p>
                  <p className="text-slate-500 mt-1">Body - 16px Regular</p>
                </div>
                
                <div>
                  <p className="text-sm text-slate-500">Conditions générales et mentions légales</p>
                  <p className="text-slate-500 mt-1">Small - 14px Regular</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Composants UI */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Circle className="h-5 w-5" />
                Composants UI
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              
              {/* Boutons */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Boutons</h3>
                <div className="flex flex-wrap gap-4">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    Commencer gratuitement
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button variant="outline">
                    Se connecter
                  </Button>
                  <Button variant="secondary">
                    En savoir plus
                  </Button>
                  <Button variant="ghost">
                    Annuler
                  </Button>
                </div>
              </div>

              {/* Cards */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Cards</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="border border-slate-200">
                    <CardHeader>
                      <CardTitle>Card Standard</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-600">Contenu de la carte avec bordure subtile</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200">
                    <CardHeader>
                      <CardTitle className="text-blue-900">Card Accentuée</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-blue-800">Carte avec arrière-plan coloré pour mettre en avant</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Usage Guidelines */}
          <Card>
            <CardHeader>
              <CardTitle>Guidelines d'Usage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-green-600 mb-3">✅ À faire</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Utiliser le logo dans ses proportions originales</li>
                    <li>• Respecter l'espace minimum autour du logo</li>
                    <li>• Utiliser les couleurs officielles de la palette</li>
                    <li>• Maintenir un contraste suffisant pour la lisibilité</li>
                    <li>• Utiliser Space Grotesk comme police principale</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-red-600 mb-3">❌ À éviter</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Déformer ou étirer le logo</li>
                    <li>• Utiliser des couleurs non autorisées</li>
                    <li>• Placer le logo sur un arrière-plan complexe</li>
                    <li>• Utiliser une taille de logo inférieure à 16px</li>
                    <li>• Mélanger différentes polices dans un même design</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center py-8 border-t border-slate-200">
            <p className="text-slate-500">
              Cette page est créée pour faciliter la création de vos supports de communication RefSpring.
            </p>
            <p className="text-sm text-slate-400 mt-2">
              Tous les éléments sont optimisés pour vos réseaux sociaux et votre fichier Figma.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default BrandIdentityPage;
