import type { StaticImageData } from "next/image";
import Image from "next/image";
import Link from "next/link";

import logoImg from "../../public/img/logotransparent.png";
import bridgeworld from "../../public/img/Bridgeworld.jpg";
import ecosystem from "../../public/img/Ecosystem.png";
import life from "../../public/img/Life.png";
import smolverse from "../../public/img/Smolverse.png";
import { Metadata } from "../components/Metadata";

type CardProps = {
  image: StaticImageData;
  name: string;
};

function Card({ image, name }: CardProps) {
  return (
    <Link href={`/cartridge/${name.toLowerCase()}`} passHref>
      <a className="hover:opacity-60 transition-opacity duration-300">
        <div className="bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-100 p-3 rounded-md">
          <Image
            alt={name}
            src={image.src}
            width={image.width}
            height={image.height}
          />
          <div className="text-center text-lg p-3">{name}</div>
        </div>
      </a>
    </Link>
  );
}

export default function Home() {
  return (
    <div className="relative">
      <Metadata
        description="Arbitrum native NFT marketplace, created by TreasureDAO and powered by $MAGIC"
        exactTitle
        image="https://marketplace.treasure.lol/img/seoBanner.png"
        title="Treasure Marketplace, native to Arbitrum"
        url="https://marketplace.treasure.lol"
      />
      <main className="flex flex-col mt-16 pt-20 w-full min-h-screen landing">
        <div className="z-10 px-8 max-w-2xl lg:max-w-7xl mx-auto">
          <div className="lg:max-w-[70%]">
            <Image
              alt="Treasure Marketplace Logo"
              src={logoImg.src}
              width={logoImg.width}
              height={logoImg.height}
              className="dark:filter dark:invert"
            />
            <p className="text-right font-semibold tracking-wider mt-2 text-lg">
              MARKETPLACE
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <Card image={bridgeworld} name="Bridgeworld" />
          <Card image={smolverse} name="Smolverse" />
          <Card image={life} name="Life" />
          <Card image={ecosystem} name="Ecosystem" />
        </div>
      </main>
    </div>
  );
}
