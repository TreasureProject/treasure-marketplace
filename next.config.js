module.exports = {
  images: {
    domains: [
      "ipfs.io",
      "life-nft.mypinata.cloud",
      "storage.googleapis.com",
      "treasure-marketplace.mypinata.cloud",
      "cdn.talesofelleria.com",
      "knightsoftheether.com",
    ],
  },
  async redirects() {
    return [
      {
        source: "/collection",
        destination: "/",
        permanent: true,
      },
    ];
  },
};
