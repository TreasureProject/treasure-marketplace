module.exports = {
  images: {
    domains: ["treasure-marketplace.mypinata.cloud", "ipfs.io"],
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
