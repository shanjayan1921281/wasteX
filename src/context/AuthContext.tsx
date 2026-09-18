import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  User 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import type { UserProfile, BusinessProfile, UserRole } from '../types';
import { seedDemoDataIfNeeded } from '../lib/seedDemoData';
import { logAuditEvent } from '../lib/auditAndNotifications';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  businessProfile: BusinessProfile | null;
  loading: boolean;
  registerUser: (email: string, pass: string, name: string, role: UserRole, companyName: string, city: string) => Promise<void>;
  loginUser: (email: string, pass: string) => Promise<void>;
  logoutUser: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  switchDemoRole: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Load user data from Firestore
  const loadUserData = async (user: User) => {
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userDocRef);
      if (userSnap.exists()) {
        const uData = userSnap.data() as UserProfile;
        setUserProfile(uData);

        if (uData.businessId) {
          const bDocRef = doc(db, 'businesses', uData.businessId);
          const bSnap = await getDoc(bDocRef);
          if (bSnap.exists()) {
            setBusinessProfile(bSnap.data() as BusinessProfile);
          }
        }
      } else {
        // Fallback default profile if document doesn't exist yet
        const defaultRole: UserRole = user.email?.includes('admin') ? 'admin' : 'industry';
        const newProf: UserProfile = {
          uid: user.uid,
          name: user.displayName || user.email?.split('@')[0] || 'User',
          email: user.email || '',
          role: defaultRole,
          isVerified: true,
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await setDoc(userDocRef, newProf);
        setUserProfile(newProf);
      }
    } catch (err) {
      console.error('Error loading user profile:', err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await loadUserData(user);
        // Seed demo data if needed once an authenticated session exists
        seedDemoDataIfNeeded().catch((e) => console.warn('Demo seed notice:', e));
      } else {
        setUserProfile(null);
        setBusinessProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
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
    city: string
  ) => {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    const uid = cred.user.uid;
    const now = new Date().toISOString();

    const businessId = `biz-${uid.slice(0, 8)}`;

    const newBusiness: BusinessProfile = {
      businessId,
      ownerUserId: uid,
      businessName: companyName,
      businessType: role,
      role: role,
      industryCategory: role === 'industry' ? 'Manufacturing / Processing' : 'Recycling & Secondary Trading',
      description: `${companyName} operations in ${city}`,
      phone: '',
      email: email,
      address: `${city} Industrial Zone`,
      city: city || 'Coimbatore',
      state: 'Tamil Nadu',
      country: 'India',
      verificationStatus: 'VERIFIED', // Verified for seamless hackathon workflow
      createdAt: now,
      updatedAt: now,
    };

    const newProfile: UserProfile = {
      uid,
      name,
      email,
      role,
      businessId,
      phone: '',
      location: city,
      isVerified: true,
      status: 'active',
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(doc(db, 'businesses', businessId), newBusiness);
    await setDoc(doc(db, 'users', uid), newProfile);

    setUserProfile(newProfile);
    setBusinessProfile(newBusiness);

    await logAuditEvent(uid, role, 'REGISTER_AND_CREATE_BUSINESS', 'user', uid, { email, role, companyName });
  };

  const loginUser = async (email: string, pass: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    if (cred.user) {
      await loadUserData(cred.user);
      await logAuditEvent(cred.user.uid, userProfile?.role || 'industry', 'LOGIN', 'user', cred.user.uid, { email });
    }
  };

  const logoutUser = async () => {
    if (currentUser && userProfile) {
      await logAuditEvent(currentUser.uid, userProfile.role, 'LOGOUT', 'user', currentUser.uid);
    }
    await firebaseSignOut(auth);
    setUserProfile(null);
    setBusinessProfile(null);
  };

  // Demo helper to easily switch between all 5 roles:
  // 1. Waste Owner / User
  // 2. Dealer / Buyer
  // 3. Recycler
  // 4. Consumer
  // 5. Admin
  const switchDemoRole = async (targetRole: UserRole) => {
    let normalizedRole: UserRole = targetRole === 'industry' ? 'owner' : targetRole;
    let mockUid = `demo-${normalizedRole}-uid`;
    let mockEmail = `${normalizedRole}@wastexchange.demo`;
    let mockName = 'User';
    let bizId: string | undefined = undefined;

    switch (normalizedRole) {
      case 'owner':
        mockName = 'Ramesh Kumar (Waste Owner)';
        bizId = 'demo-biz-textile-01';
        break;
      case 'dealer':
        mockName = 'Senthil Nathan (Dealer / Buyer)';
        bizId = 'demo-biz-dealer-01';
        break;
      case 'recycler':
        mockName = 'Dr. K. Mohan (Recycling Facility)';
        bizId = 'recycler-01';
        break;
      case 'consumer':
        mockName = 'Arun Kumar (Eco Consumer)';
        bizId = undefined;
        break;
      case 'admin':
        mockName = 'Admin Controller';
        bizId = 'demo-biz-admin';
        break;
    }

    const p: UserProfile = {
      uid: mockUid,
      name: mockName,
      email: mockEmail,
      role: targetRole,
      businessId: bizId,
      location: 'Coimbatore',
      isVerified: true,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Attempt Firebase Auth session for the demo account
    const demoPassword = 'WasteXchangeDemo2026!';
    try {
      if (!auth.currentUser || auth.currentUser.email !== mockEmail) {
        try {
          await signInWithEmailAndPassword(auth, mockEmail, demoPassword);
        } catch (authErr: any) {
          if (
            authErr?.code === 'auth/user-not-found' || 
            authErr?.code === 'auth/invalid-credential' || 
            authErr?.code === 'auth/invalid-login-credentials'
          ) {
            try {
              await createUserWithEmailAndPassword(auth, mockEmail, demoPassword);
            } catch (createErr) {
              console.warn('Demo account registration notice:', createErr);
            }
          }
        }
      }
    } catch (authNotice) {
      console.warn('Notice establishing demo auth session:', authNotice);
    }

    if (auth.currentUser) {
      const updated = { 
        ...p, 
        uid: auth.currentUser.uid,
        updatedAt: new Date().toISOString() 
      } as UserProfile;
      try {
        await setDoc(doc(db, 'users', auth.currentUser.uid), updated, { merge: true });
      } catch (saveErr) {
        console.warn('Could not save user profile:', saveErr);
      }
      setUserProfile(updated);
    } else {
      setUserProfile(p);
    }
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
        logoutUser,
        refreshProfile,
        switchDemoRole,
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
