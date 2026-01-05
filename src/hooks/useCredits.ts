import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface UserCredits {
  id: string;
  user_id: string;
  credits_remaining: number;
  daily_credits: number;
  monthly_credits: number;
  plan: 'free' | 'water' | 'glacicer';
  is_unlimited: boolean;
  last_daily_reset: string;
  last_monthly_reset: string;
}

export interface Plan {
  id: 'free' | 'water' | 'glacicer';
  name: string;
  price: number;
  creditsPerMonth: number;
  dailyCredits: number;
  features: string[];
}

export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    creditsPerMonth: 0,
    dailyCredits: 10,
    features: ['10 credits per day', 'Basic website generation', 'Preview websites'],
  },
  {
    id: 'water',
    name: 'Water',
    price: 25,
    creditsPerMonth: 500,
    dailyCredits: 0,
    features: ['500 credits per month', 'Priority generation', 'Save unlimited websites', 'Custom domains'],
  },
  {
    id: 'glacicer',
    name: 'Glacicer',
    price: 50,
    creditsPerMonth: 1000,
    dailyCredits: 0,
    features: ['1000 credits per month', 'Priority generation', 'Save unlimited websites', 'Custom domains', 'Premium support'],
  },
];

export const useCredits = () => {
  const { user } = useAuth();
  const [credits, setCredits] = useState<UserCredits | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCredits = useCallback(async () => {
    if (!user) {
      setCredits(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_credits')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        // If no credits record exists, create one
        if (error.code === 'PGRST116') {
          const { data: newCredits, error: insertError } = await supabase
            .from('user_credits')
            .insert({ user_id: user.id })
            .select()
            .single();
          
          if (!insertError && newCredits) {
            setCredits(newCredits as UserCredits);
          }
        }
      } else {
        // Check if daily reset is needed
        const lastReset = new Date(data.last_daily_reset);
        const now = new Date();
        const hoursSinceReset = (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60);
        
        if (hoursSinceReset >= 24 && data.plan === 'free') {
          // Reset daily credits
          const { data: updatedCredits, error: updateError } = await supabase
            .from('user_credits')
            .update({ 
              credits_remaining: data.daily_credits,
              last_daily_reset: now.toISOString()
            })
            .eq('user_id', user.id)
            .select()
            .single();
          
          if (!updateError && updatedCredits) {
            setCredits(updatedCredits as UserCredits);
          }
        } else {
          setCredits(data as UserCredits);
        }
      }
    } catch (err) {
      console.error('Error fetching credits:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  const useCredit = async (amount: number = 1): Promise<boolean> => {
    if (!credits || !user) return false;
    
    if (credits.is_unlimited) return true;
    
    if (credits.credits_remaining < amount) return false;

    const { data, error } = await supabase
      .from('user_credits')
      .update({ credits_remaining: credits.credits_remaining - amount })
      .eq('user_id', user.id)
      .select()
      .single();

    if (!error && data) {
      setCredits(data as UserCredits);
      
      // Log transaction
      await supabase.from('credit_transactions').insert({
        user_id: user.id,
        amount: -amount,
        transaction_type: 'usage',
        description: 'Website generation',
      });
      
      return true;
    }
    
    return false;
  };

  const hasCredits = credits ? (credits.is_unlimited || credits.credits_remaining > 0) : false;

  return {
    credits,
    loading,
    hasCredits,
    useCredit,
    refreshCredits: fetchCredits,
    plans: PLANS,
  };
};
