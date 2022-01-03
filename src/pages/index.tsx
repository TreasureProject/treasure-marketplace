import Image from "next/image";

import logoImg from "../../public/img/logotransparent.png";
import { useRouter } from "next/router";
import { useCollections } from "../lib/hooks";
import { SearchAutocomplete } from "../components/SearchAutocomplete";
import { Item } from "react-stately";
import TreasureImg1 from "../../public/img/Beetle-wing.gif";
import TreasureImg2 from "../../public/img/Donkey.gif";
import TreasureImg3 from "../../public/img/Divine Hourglass.gif";
import TreasureImg4 from "../../public/img/Grin.gif";
import TreasureImg5 from "../../public/img/Honeycomb.gif";
import TreasureImg6 from "../../public/img/Thread of Divine Silk.gif";
import LegionsImg1 from "../../public/img/Numeraire 3.png";
import LegionsImg2 from "../../public/img/Riverman 5.png";
import LegionsImg3 from "../../public/img/Siege 2.png";
import LegionsImg4 from "../../public/img/Warlock.png";
import LegionsImg5 from "../../public/img/Assassin 1.png";
import LegionsImg6 from "../../public/img/All-Class14.png";
import SmolImg1 from "../../public/img/smolbrains.png";
import SmolImg2 from "../../public/img/smolbrains1.png";
import SmolImg3 from "../../public/img/smolbrains2.png";
import SmolImg4 from "../../public/img/smolbrains3.png";
import SmolImg5 from "../../public/img/smolbrains4.png";
import SmolImg6 from "../../public/img/smolbrains5.png";
import Link from "next/link";
import { getCollectionSlugFromName } from "../utils";

const ImageWrapper = ({ image }: { image: StaticImageData }) => (
  <Image src={image.src} width={image.width} height={image.height} />
);

export default function Home() {
  const Router = useRouter();
  const data = useCollections();

  return (
    <div className="relative">
      <main className="flex justify-center items-center w-full min-h-screen landing">
        <div className="flex relative lg:flex-row flex-col-reverse px-8 lg:px-0">
          <div
            className="z-10 pl-0 lg:pl-8 xl:pl-0"
            style={{
              flexBasis: "70%",
            }}
          >
            <Image
              src={logoImg.src}
              width={logoImg.width}
              height={logoImg.height}
              className="dark:filter dark:invert"
            />
            <p className="text-right font-semibold tracking-wider mt-2 text-lg">
              MARKETPLACE
            </p>
            <div className="mt-4 flex items-center space-x-6 divide-x-[1px]">
              <Link href="/inventory" passHref>
                <a className="hover:text-gray-900 text-gray-500 dark:hover:text-gray-200">
                  Inventory
                </a>
              </Link>
              <div className="w-full pl-6">
                <SearchAutocomplete
                  label="Search Collection"
                  allowsCustomValue
                  onSelectionChange={(name) => {
                    const targetCollection = data.find(
                      (collection) => collection.name === name
                    );

                    if (targetCollection) {
                      const slugOrAddress =
                        getCollectionSlugFromName(targetCollection.name) ??
                        targetCollection.address;

                      Router.push(`/collection/${slugOrAddress}`);
                    }
                  }}
                >
                  {data.map((collection) => (
                    <Item key={collection.name}>{collection.name}</Item>
                  )) ?? []}
                </SearchAutocomplete>
              </div>
            </div>
          </div>

          <div className="absolute right-0 -top-52 z-0 overflow-hidden">
            <div className="maskImage">
              <div className="grid grid-cols-6 grid-rows-3 gap-6 lg:gap-12 px-12 lg:px-0 opacity-30 lg:opacity-80">
                <ImageWrapper image={TreasureImg1} />
                <ImageWrapper image={TreasureImg2} />
                <ImageWrapper image={TreasureImg3} />
                <ImageWrapper image={TreasureImg4} />
                <ImageWrapper image={TreasureImg5} />
                <ImageWrapper image={TreasureImg6} />
                <ImageWrapper image={LegionsImg1} />
                <ImageWrapper image={LegionsImg2} />
                <ImageWrapper image={LegionsImg3} />
                <ImageWrapper image={LegionsImg4} />
                <ImageWrapper image={LegionsImg5} />
                <ImageWrapper image={LegionsImg6} />
                <ImageWrapper image={SmolImg1} />
                <ImageWrapper image={SmolImg2} />
                <ImageWrapper image={SmolImg3} />
                <ImageWrapper image={SmolImg4} />
                <ImageWrapper image={SmolImg5} />
                <ImageWrapper image={SmolImg6} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

Home.disableHeader = true;
