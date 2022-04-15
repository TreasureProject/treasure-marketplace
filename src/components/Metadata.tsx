import Head from "next/head";

type MetadataProps = {
  title?: string;
  description?: string;
  url?: string;
  image?: string;
};

const Metadata = ({
  title = "Treasure Marketplace",
  description = "Arbitrum native NFT marketplace, created by TreasureDAO",
  url = "http://marketplace.treasure.lol/",
  image = "http://marketplace.treasure.lol/img/seoBanner.png",
}: MetadataProps) => (
  <Head>
    <meta name="title" content={title} />
    <meta name="description" content={description} />
    <meta property="og:type" content="website" />
    <meta property="og:url" content={url} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:image" content={image} />
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:url" content={url} />
    <meta property="twitter:title" content={title} />
    <meta property="twitter:description" content={description} />
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
    <link rel="manifest" href="/site.webmanifest" />
    <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
    <meta name="msapplication-TileColor" content="#da532c" />
    <meta name="theme-color" content="#ffffff" />
    <script async src="https://cdn.splitbee.io/sb.js"></script>
  </Head>
);

export default Metadata;