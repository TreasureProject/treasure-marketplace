import type { GetServerSidePropsContext } from "next";
import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { Metadata, MetadataProps } from "../../components/Metadata";
import { ALL_COLLECTION_METADATA } from "../../const";
import battlefly from "../../../public/img/Battlefly.jpg";
import bridgeworld from "../../../public/img/Bridgeworld.jpg";
import ecosystem from "../../../public/img/Ecosystem.jpg";
import smolverse from "../../../public/img/Smolverse.jpg";

type Cartridge = keyof typeof cartridgesMap;

const unique = <T,>(array: T[]) => Array.from(new Set(array));
const cartridges: string[] = unique(
  ALL_COLLECTION_METADATA.map((metadata) => metadata.cartridge).filter(Boolean)
);

const cartridgesMap = {
  battlefly: {
    name: "BattleFly",
    description:
      "BattleFly is an experimental PVP/P2E strategy game, powered by $MAGIC.",
    image: battlefly,
  },
  bridgeworld: {
    name: "Bridgeworld",
    description:
      "Bridgeworld is a game of strategic commerce, trade and domination which sits at the center of the Treasure metaverse. Legions, Treasures and other NFTs native to Bridgeworld, represent player characters and items that are used to explore, create and ultimately extract $MAGIC from the world.",
    image: bridgeworld,
  },
  ecosystem: {
    name: "Ecosystem",
    description:
      "The Treasure ecosystem is vast and evergrowing, here we capture new projects and metaverses as they are revealed.",
    image: ecosystem,
  },
  smolverse: {
    name: "Smolverse",
    description:
      "Smolverse began with the Smol Brains NFT collection, a dynamically evolving PFP of a monkey whose head gets bigger the larger its IQ becomes.",
    image: smolverse,
  },
} as const;

function CartridgeImage({ cartridge }: { cartridge: Cartridge }) {
  const { image, name } = cartridgesMap[cartridge];

  return (
    <div className="bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-100 p-3 rounded-md">
      <Image
        alt={name}
        src={image.src}
        width={image.width}
        height={image.height}
      />
      <div className="text-center text-lg p-3">{name}</div>
    </div>
  );
}

export default function Cartridge({ og }: { og: MetadataProps }) {
  const router = useRouter();
  const { cartridge } = router.query;

  if (typeof cartridge === "string" && !cartridges.includes(cartridge)) {
    return router.replace("/");
  }

  return (
    <div className="relative">
      <Metadata {...og} />
      <main className="flex flex-col mt-16 pt-20 w-full min-h-screen landing">
        <div className="z-10 px-8 max-w-2xl lg:max-w-7xl mx-auto">
          <CartridgeImage cartridge={cartridge as Cartridge} />
        </div>

        <div className="max-w-2xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:max-w-7xl lg:px-8">
          <h2 className="sr-only">Collections</h2>

          <div className="grid gap-4 grid-cols-2 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-3 lg:gap-x-8">
            {ALL_COLLECTION_METADATA.filter(
              (metadata) => metadata.cartridge === cartridge
            ).map((product) => (
              <div
                key={product.href}
                className="group relative bg-white dark:bg-gray-500 border border-gray-200 dark:border-gray-600 rounded-lg flex flex-col overflow-hidden"
              >
                <div
                  className={clsx(
                    "relative aspect-none group-hover:opacity-75",
                    product.imageBgColor
                      ? `bg-[${product.imageBgColor}]`
                      : "bg-gray-200"
                  )}
                >
                  <Image
                    src={product.image}
                    alt={product.name}
                    layout="responsive"
                    width={400}
                    height={400}
                    objectFit={product.imageContain ? "contain" : "fill"}
                  />
                </div>
                <div className="flex-1 p-4 space-y-2 flex flex-col">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-50">
                    <Link href={`/collection/${product.href}`}>
                      <a>
                        <span aria-hidden="true" className="absolute inset-0" />
                        {product.name}
                      </a>
                    </Link>
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-300">
                    {product.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  if (!context.params) {
    throw new Error("No params");
  }

  const { cartridge } = context.params;

  if (typeof cartridge !== "string") {
    throw new Error("`cartridge` is not a string");
  }

  const { description, image, name } = cartridgesMap[cartridge];

  return {
    props: {
      og: {
        description,
        image,
        title: name,
        url: `https://marketplace.treasure.lol${context.resolvedUrl}`,
      },
    },
  };
}
