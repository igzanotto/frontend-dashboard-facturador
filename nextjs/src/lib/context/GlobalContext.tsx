// src/lib/context/GlobalContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { createSPASassClient } from '@/lib/supabase/client';

type User = {
    id: string;
};

type Profile = {
    id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
    phone: string | null;
    avatar_url: string | null;
    role: string;
    created_at: Date;
    updated_at: Date;
};

interface GlobalContextType {
    loading: boolean;
    user: User | null;
    profile: Profile | null;
    refreshProfile: () => Promise<void>;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export function GlobalProvider({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);

    const fetchProfile = async (client: any, userId: string) => {
        const { data: profileData, error } = await client
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            console.error('Error fetching profile:', error);
            return null;
        }

        return profileData ? {
            ...profileData,
            created_at: new Date(profileData.created_at),
            updated_at: new Date(profileData.updated_at)
        } : null;
    };

    const refreshProfile = async () => {
        if (!user) return;
        
        try {
            const supabase = await createSPASassClient();
            const client = supabase.getSupabaseClient();
            const newProfile = await fetchProfile(client, user.id);
            setProfile(newProfile);
        } catch (error) {
            console.error('Error refreshing profile:', error);
        }
    };

    useEffect(() => {
        async function loadData() {
            try {
                const supabase = await createSPASassClient();
                const client = supabase.getSupabaseClient();

                // Get user data
                const { data: { user } } = await client.auth.getUser();
                if (user) {
                    setUser({ id: user.id });

                    // Fetch profile data
                    const profileData = await fetchProfile(client, user.id);
                    setProfile(profileData);
                } else {
                    throw new Error('User not found');
                }

            } catch (error) {
                console.error('Error loading data:', error);
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, []);

    return (
        <GlobalContext.Provider value={{ loading, user, profile, refreshProfile }}>
            {children}
        </GlobalContext.Provider>
    );
}

export const useGlobal = () => {
    const context = useContext(GlobalContext);
    if (context === undefined) {
        throw new Error('useGlobal must be used within a GlobalProvider');
    }
    return context;
};