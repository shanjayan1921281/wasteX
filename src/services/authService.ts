import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { UserProfile, UserRole } from '../types';

export const authService = {
  async signUp(
    email: string,
    password: string,
    fullName: string,
    role: UserRole,
    companyName: string,
    city: string
  ) {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured.');
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
          business_name: companyName,
          location: city
        }
      }
    });

    if (authError) throw authError;
    const user = authData.user;
    if (!user) throw new Error('User creation failed');

    const businessId = `biz-${user.id.slice(0, 8)}`;
    const now = new Date().toISOString();

    const { error: profileError } = await supabase.from('profiles').upsert({
      id: user.id,
      full_name: fullName,
      email,
      role,
      business_name: companyName,
      business_id: businessId,
      location: city,
      is_verified: true,
      status: 'active',
      created_at: now,
      updated_at: now
    });

    if (profileError) {
      console.warn('Profile creation notice in Supabase:', profileError);
    }

    const profile: UserProfile = {
      uid: user.id,
      name: fullName,
      email,
      role,
      businessId,
      location: city,
      isVerified: true,
      status: 'active',
      createdAt: now,
      updatedAt: now
    };

    return { user, profile };
  },

  async signIn(email: string, password: string) {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured.');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return { user: data.user, session: data.session };
  },

  async signOut() {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
  },

  async getCurrentSession() {
    if (!isSupabaseConfigured()) return null;
    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  async getCurrentUser() {
    if (!isSupabaseConfigured()) return null;
    const { data } = await supabase.auth.getUser();
    return data.user;
  },

  async getProfile(userId: string): Promise<UserProfile | null> {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !data) return null;

      return {
        uid: data.id,
        name: data.full_name || 'User',
        email: data.email || '',
        role: data.role as UserRole,
        businessId: data.business_id,
        phone: data.phone,
        location: data.location,
        isVerified: data.is_verified ?? true,
        status: data.status || 'active',
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (err) {
      console.warn('Error fetching profile from Supabase:', err);
      return null;
    }
  },

  async upsertProfile(profile: UserProfile): Promise<void> {
    if (!isSupabaseConfigured()) return;
    try {
      await supabase.from('profiles').upsert({
        id: profile.uid,
        full_name: profile.name,
        email: profile.email,
        role: profile.role,
        business_id: profile.businessId,
        phone: profile.phone,
        location: profile.location,
        is_verified: profile.isVerified,
        status: profile.status,
        updated_at: new Date().toISOString()
      });
    } catch (err) {
      console.warn('Error upserting profile in Supabase:', err);
    }
  }
};
