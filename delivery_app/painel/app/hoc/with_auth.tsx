// HOC

'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { protectRoute } from '../utils/protect_route';

const withAuth = (WrappedComponent: React.ComponentType<any>) => {
    const AuthComponent = (props: any) => {
        const router = useRouter();

        useEffect(() => {
            const checkAuth = async () => {
                try {
                    await protectRoute(router);
                } catch (err) {
                    // O protectRoute já redireciona
                }
            };

            checkAuth();
        }, [router]);

        return <WrappedComponent {...props} />;
    };

    return AuthComponent;
};

export default withAuth;
