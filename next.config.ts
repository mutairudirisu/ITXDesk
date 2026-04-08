import type { NextConfig } from "next";

const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
})

const nextConfig: NextConfig = {
  images: {
    domains: ['uwrwuapfrdcrvjugfycn.supabase.co']
  }
};

export default withPWA(nextConfig);


// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   images: {
//     domains: ['uwrwuapfrdcrvjugfycn.supabase.co'], // Add your Supabase domain here
//   },
// };

// module.exports = nextConfig;
