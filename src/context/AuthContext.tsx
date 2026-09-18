import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { UserProfile, BusinessProfile, UserRole } from '../types';
import { logAuditEvent } from '../lib/auditAndNotifications';

interface AuthContextType {
  currentUser: SupabaseUser | null;
  userProfile: UserProfile | null;
  businessProfile: BusinessProfile | null;
  loading: boolean;
  registerUser: (
    email: string,
    pass: string,
    name: string,
    role: UserRole,
    companyName: string,
    city: string,
    phone?: string
  ) => Promise<void>;
  loginUser: (email: string, pass: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logoutUser: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<SupabaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Load user data from Supabase profiles table
  const loadUserData = async (user: SupabaseUser) => {
    try {
      if (!isSupabaseConfigured()) return;

      const { data: profileData, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileData && !profileErr) {
        const uData: UserProfile = {
          uid: profileData.id,
          name: profileData.full_name || user.email?.split('@')[0] || 'User',
          email: profileData.email || user.email || '',
          role: profileData.role as UserRole,
          businessId: profileData.business_id,
          phone: profileData.phone,
          location: profileData.location,
          isVerified: profileData.is_verified ?? true,
          status: profileData.status || 'active',
          createdAt: profileData.created_at,
          updatedAt: profileData.updated_at
        };
        setUserProfile(uData);

        if (profileData.business_name) {
          setBusinessProfile({
            businessId: profileData.business_id || `biz-${profileData.id.slice(0, 8)}`,
            ownerUserId: profileData.id,
            businessName: profileData.business_name,
            businessType: profileData.role === 'industry' ? 'industry' : 'dealer',
            role: profileData.role as any,
            industryCategory: profileData.role === 'industry' ? 'Textile & Manufacturing' : 'Recycling & Materials Trading',
            description: `${profileData.business_name} operations in ${profileData.location || 'Tamil Nadu'}`,
            phone: profileData.phone || '',
            email: profileData.email || user.email || '',
            address: `${profileData.location || 'Coimbatore'} Industrial Zone`,
            city: profileData.location || 'Coimbatore',
            state: 'Tamil Nadu',
            country: 'India',
            verificationStatus: 'VERIFIED',
            createdAt: profileData.created_at,
            updatedAt: profileData.updated_at
          });
        }
      } else {
        // Build profile from user metadata if available
        const userMeta = user.user_metadata || {};
        const fallbackRole = (userMeta.role as UserRole) || 'industry';
        const businessName = userMeta.business_name || '';
        const location = userMeta.location || '';
        const businessId = `biz-${user.id.slice(0, 8)}`;
        const now = new Date().toISOString();

        await supabase.from('profiles').upsert({
          id: user.id,
          full_name: userMeta.full_name || user.email?.split('@')[0] || 'User',
          email: user.email,
          role: fallbackRole,
          business_name: businessName,
          business_id: businessId,
          location: location,
          is_verified: true,
          status: 'active',
          created_at: now,
          updated_at: now
        });

        const freshProf: UserProfile = {
          uid: user.id,
          name: userMeta.full_name || user.email?.split('@')[0] || 'User',
          email: user.email || '',
          role: fallbackRole,
          businessId,
          location,
          isVerified: true,
          status: 'active',
          createdAt: now,
          updatedAt: now
        };
        setUserProfile(freshProf);

        if (businessName) {
          setBusinessProfile({
            businessId,
            ownerUserId: user.id,
            businessName,
            businessType: fallbackRole === 'industry' ? 'industry' : 'dealer',
            role: fallbackRole as any,
            industryCategory: fallbackRole === 'industry' ? 'Textile & Manufacturing' : 'Recycling & Materials Trading',
            description: `${businessName} operations in ${location || 'Tamil Nadu'}`,
            phone: '',
            email: user.email || '',
            address: `${location || 'Coimbatore'} Industrial Zone`,
            city: location || 'Coimbatore',
            state: 'Tamil Nadu',
            country: 'India',
            verificationStatus: 'VERIFIED',
            createdAt: now,
            updatedAt: now
          });
        }
      }
    } catch (err) {
      console.warn('Error loading user profile from Supabase:', err);
    }
  };

  useEffect(() => {
    let mounted = true;

    if (isSupabaseConfigured()) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!mounted) return;
        if (session?.user) {
          setCurrentUser(session.user);
          loadUserData(session.user).finally(() => {
            if (mounted) setLoading(false);
          });
        } else {
          setCurrentUser(null);
          setUserProfile(null);
          setBusinessProfile(null);
          setLoading(false);
        }
      });

      const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (!mounted) return;
        if (session?.user) {
          setCurrentUser(session.user);
          await loadUserData(session.user);
        } else {
          setCurrentUser(null);
          setUserProfile(null);
          setBusinessProfile(null);
        }
        setLoading(false);
      });

      return () => {
        mounted = false;
        authListener.subscription.unsubscribe();
      };
    } else {
      setLoading(false);
    }
  }, []);

  const refreshProfile = async () => {
    if (currentUser) {
      await loadUserData(currentUser);
    }
  };

  const registerUser = async (
    email: string,
    pass: string,
    name: string,
    role: UserRole,
    companyName: string,
    city: string,
    phone?: string
  ) => {
    const now = new Date().toISOString();

    if (!isSupabaseConfigured()) {
      throw new Error('Database connection is not configured.');
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        data: {
          full_name: name,
          role,
          business_name: companyName,
          location: city,
          phone: phone || ''
        }
      }
    });

    if (error) throw error;
    const user = data.user;
    if (!user) throw new Error('Registration failed');

    const businessId = `biz-${user.id.slice(0, 8)}`;

    // Write profile to Supabase
    await supabase.from('profiles').upsert({
      id: user.id,
      full_name: name,
      email,
      role,
      business_name: companyName,
      business_id: businessId,
      location: city,
      phone: phone || '',
      is_verified: true,
      status: 'active',
      created_at: now,
      updated_at: now
    });

    const newProfile: UserProfile = {
      uid: user.id,
      name,
      email,
      role,
      businessId,
      phone: phone || '',
      location: city,
      isVerified: true,
      status: 'active',
      createdAt: now,
      updatedAt: now
    };

    const newBusiness: BusinessProfile = {
      businessId,
      ownerUserId: user.id,
      businessName: companyName,
      businessType: role,
      role,
      industryCategory: role === 'industry' ? 'Manufacturing / Processing' : 'Recycling & Secondary Trading',
      description: `${companyName} operations in ${city}`,
      phone: phone || '',
      email,
      address: `${city} Industrial Zone`,
      city: city || 'Coimbatore',
      state: 'Tamil Nadu',
      country: 'India',
      verificationStatus: 'VERIFIED',
      createdAt: now,
      updatedAt: now
    };

    setUserProfile(newProfile);
    setBusinessProfile(newBusiness);
    setCurrentUser(user);

    await logAuditEvent(user.id, role, 'REGISTER_AND_CREATE_BUSINESS', 'user', user.id, { email, role, companyName });
  };

  const loginUser = async (email: string, pass: string) => {
    if (!isSupabaseConfigured()) {
      throw new Error('Database connection is not configured.');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: pass
    });
    if (error) throw error;
    if (data.user) {
      setCurrentUser(data.user);
      await loadUserData(data.user);
      await logAuditEvent(data.user.id, userProfile?.role || 'industry', 'LOGIN', 'user', data.user.id, { email });
    }
  };

  const resetPassword = async (email: string) => {
    if (!isSupabaseConfigured()) {
      throw new Error('Database connection is not configured.');
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  };

  const logoutUser = async () => {
    if (currentUser && userProfile) {
      await logAuditEvent(currentUser.id, userProfile.role, 'LOGOUT', 'user', currentUser.id);
    }
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    setCurrentUser(null);
    setUserProfile(null);
    setBusinessProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        businessProfile,
        loading,
        registerUser,
        loginUser,
        resetPassword,
        logoutUser,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
