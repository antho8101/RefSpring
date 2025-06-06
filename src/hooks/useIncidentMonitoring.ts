
import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  onSnapshot,
  addDoc,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Incident {
  id: string;
  title: string;
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  severity: 'minor' | 'major' | 'critical';
  description: string;
  createdAt: Date;
  resolvedAt?: Date;
  affectedServices: string[];
  updates: {
    id: string;
    timestamp: Date;
    message: string;
    status: string;
  }[];
}

export const useIncidentMonitoring = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🚨 Chargement des incidents...');
    
    const incidentsRef = collection(db, 'incidents');
    const q = query(
      incidentsRef, 
      orderBy('createdAt', 'desc'), 
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const incidentsData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          resolvedAt: data.resolvedAt?.toDate(),
          updates: data.updates?.map((update: any) => ({
            ...update,
            timestamp: update.timestamp?.toDate() || new Date(),
          })) || [],
        };
      }) as Incident[];
      
      console.log('🚨 Incidents chargés:', incidentsData.length);
      setIncidents(incidentsData);
      setLoading(false);
    }, (error) => {
      console.error('❌ Erreur lors du chargement des incidents:', error);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const createIncident = async (incident: Omit<Incident, 'id' | 'createdAt' | 'updates'>) => {
    try {
      console.log('🚨 Création d\'un nouvel incident:', incident.title);
      
      await addDoc(collection(db, 'incidents'), {
        ...incident,
        createdAt: Timestamp.now(),
        updates: [],
      });
      
      console.log('✅ Incident créé avec succès');
    } catch (error) {
      console.error('❌ Erreur lors de la création de l\'incident:', error);
      throw error;
    }
  };

  return {
    incidents,
    loading,
    createIncident,
  };
};
