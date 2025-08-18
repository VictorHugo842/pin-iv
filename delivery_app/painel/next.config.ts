import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    output: "standalone",
    images: {
        remotePatterns: [
            {
                protocol: "http",
                hostname: "localhost",
                port: "5000",          
                pathname: "/uploads/logos/**",
            },
        ],
    },
};

export default nextConfig;
