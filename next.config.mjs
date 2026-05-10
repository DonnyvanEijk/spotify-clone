/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      remotePatterns: [
        'misc.scdn.co',
        'i.scdn.co',
        'geo-media.beatsource.com',
        'i1.sndcdn.com',
        'media.pitchfork.com',
        'seed-mix-image.spotifycdn.com',
        'odofdqdzdcexavpydvyh.supabase.co',
        'adxjpnustqsioshftfqe.supabase.co',
      ].map(hostname => ({ protocol: 'https', hostname })),
    },
  };
  
export default nextConfig;