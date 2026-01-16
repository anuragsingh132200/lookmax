import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { useUserStore } from '../stores/userStore';

export default function Index() {
    const { isAuthenticated, user } = useUserStore();

    // Not authenticated - go to login
    if (!isAuthenticated) {
        return <Redirect href="/(auth)/login" />;
    }

    // New user - hasn't completed onboarding
    if (!user?.isOnboarded) {
        return <Redirect href="/(onboarding)/features" />;
    }

    // Hasn't completed first scan
    if (!user?.hasCompletedFirstScan) {
        return <Redirect href="/(scan)/scanner" />;
    }

    // Existing user - go to home
    return <Redirect href="/(main)/home" />;
}
