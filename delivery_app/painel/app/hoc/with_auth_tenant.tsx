// HOC

'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { protectRouteTenant } from '../utils/protect_route_tenant';

const withAuthTenant = (WrappedComponent: React.ComponentType<any>) => {
    const AuthTenantComponent = (props: any) => {
        const router = useRouter();

        useEffect(() => {
            const checkAuthTenant = async () => {
                try {
                    await protectRouteTenant(router);
                } catch (err) {
                    // O protectRoute já redireciona
                }
            };

            checkAuthTenant();
        }, [router]);

        return <WrappedComponent {...props} />;
    };

    return AuthTenantComponent;
};

export default withAuthTenant;
