import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Code, Puzzle } from 'lucide-react';

interface IntegrationTypeSelectorProps {
  activeType: 'code' | 'plugin';
  onTypeChange: (type: 'code' | 'plugin') => void;
  children: React.ReactNode;
}

export const IntegrationTypeSelector = ({ activeType, onTypeChange, children }: IntegrationTypeSelectorProps) => {
  return (
    <div>
      <Tabs value={activeType} onValueChange={(value) => onTypeChange(value as 'code' | 'plugin')}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="code" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              Intégration par code
            </TabsTrigger>
            <TabsTrigger value="plugin" className="flex items-center gap-2">
              <Puzzle className="h-4 w-4" />
              Plugins CMS
            </TabsTrigger>
          </TabsList>
          
          {children}
        </Tabs>
    </div>
  );
};