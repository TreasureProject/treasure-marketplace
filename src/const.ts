import { ChainId } from "@usedapp/core";
import smolBodiesImg from "../public/img/smolbodies.png";
import talesOfElleriaRelicsImg from "../public/img/tales-of-elleria-relics.png";
import toadstoolzImg from "../public/img/toadstoolz.jpg";
import toadstoolzItemzImg from "../public/img/toadstoolz-itemz.svg";
import theLostDonkeysImg from "../public/img/the-lost-donkeys.png";
import peekabooImg from "../public/img/peekaboo.svg";
import realmImg from "../public/img/realm.jpg";

type CollectionData = Record<
  "description" | "href" | "image" | "name",
  string
> & {
  imageContain?: boolean;
  imageBgColor?: string;
  cartridge:
    | "bridgeworld"
    | "ecosystem"
    | "life"
    | "smolverse"
    | "bridgeworld-life";
  docs?: string;
  discord?: string;
  game?: string;
  related?: string[];
  tools?: string;
  twitter?: string;
  website?: string;
};

export const BUGGED_TELL_TOKEN_ID =
  "0x7480224ec2b98f28cee3740c80940a2f489bf352-0x14fd";

export const Contracts = {
  [ChainId.ArbitrumRinkeby]: {
    magic: "0x7693604341fDC5B73c920b8825518Ec9b6bBbb8b",
    marketplace: "0x48d515a012429d97E27aA8fC84070cF2E45e5036",
  },
  [ChainId.Arbitrum]: {
    magic: "0x539bdE0d7Dbd336b79148AA742883198BBF60342",
    marketplace: "0x09986B4e255B3c548041a30A2Ee312Fe176731c2",
  },
};

export const BridgeworldItems = [
  "Legion Auxiliary",
  "Legion Genesis",
  "Legions",
  "Consumables",
  "Balancer Crystal",
];

export const smolverseItems = [
  "Smol Bodies Pets",
  "Smol Brains Pets",
  "Smol Brains Land",
  "Smol Treasures",
  "Swolercycles",
];

export const METADATA_COLLECTIONS = [
  "KOTE Squires",
  "KOTE Potions",
  "KOTE Trinkets",
  "KOTE Rings",
  "Peek-A-Boo",
  "SamuRise Items",
  "SamuRise Land",
  "Tales of Elleria",
  "The Lost Donkeys",
  "Toadstoolz",
  "Toadstoolz Itemz",
];

const BRIDGEWORLD_DATA = {
  cartridge: "bridgeworld",
  docs: "https://docs.treasure.lol",
  game: "https://bridgeworld.treasure.lol",
  twitter: "playbridgeworld",
  website: "https://lore.treasure.lol",
} as const;

const BATTLEFLY_DATA = {
  cartridge: "ecosystem",
  docs: "https://docs.battlefly.game/overview/welcome-to-battlefly",
  game: "https://mint.battlefly.game/mission-control",
  discord: "YzpajBfRNX ",
  twitter: "BattleFlyGame",
  website: "https://battlefly.game",
} as const;

const KOTE_DATA = {
  cartridge: "ecosystem",
  discord: "kote",
  game: "https://knightsoftheether.com/squires",
  twitter: "KnightsOfTheEth",
  website: "https://knightsoftheether.com",
} as const;

const SMITHONIA_DATA = {
  cartridge: "ecosystem",
  description:
    "Smithonia is a SmithyDAO project. It's a world of staking and adventure which supports a hybrid economy where the primary objective of the game is to build the rarity of your weapon through gameplay.",
  docs: "https://assets.smithydao.lol/SmithoniaWhitePaper.pdf",
  discord: "smithydao",
  twitter: "SmithyDAO",
  website: "https://smithydao.lol",
} as const;

const SAMURISE_DATA = {
  description:
    "The Lost SamuRise is a faction based strategy game played in the fictional world of Tengoku (heaven) that has borrowed lore and stylistic elements from Samurai culture in classical Japan.",
  cartridge: "ecosystem",
  discord: "samurise",
  docs: "https://docs.samurise.xyz/docs/washipaper/prologue",
  twitter: "SamuRiseNFT",
  website: "https://samurise.xyz",
} as const;

const TALES_OF_ELLERIA_DATA = {
  cartridge: "ecosystem",
  docs: "https://docs.talesofelleria.com",
  discord: "talesofelleria",
  game: "https://app.talesofelleria.com",
  twitter: "TalesofElleria",
  website: "https://talesofelleria.com",
} as const;

export const TOADSTOOLZ = {
  href: "toadstoolz",
  name: "Toadstoolz",
  image: toadstoolzImg.src,
  description:
    "Toadstoolz is an on-chain toad life simulation game. Toadz love to hunt for $BUGZ and go on adventures.",
  cartridge: "ecosystem",
  related: ["toadstoolz-itemz"],
  discord: "toadstoolz",
  docs: "https://toadstoolznft.gitbook.io/guide",
  game: "https://toadstoolz.lol/game",
  tools: "toadstoolz",
  twitter: "toadstoolzNFT",
  website: "https://toadstoolz.lol",
} as CollectionData;

export const LOST_DONKEYS = {
  href: "the-lost-donkeys",
  name: "The Lost Donkeys",
  image: theLostDonkeysImg.src,
  description:
    "The Lost Donkeys is a PFP & Gamefi project where barns will be built and donkeys will prevail. Train your donkey to become the farmer you’ve always wanted to be and harvest $Carrot. Your donkey is never gonna give you up, never gonna let you down!",
  cartridge: "ecosystem",
  discord: "TheLostDonkeys",
  twitter: "TheLostDonkeys",
  website: "https://thelostdonkeys.com",
} as CollectionData;

export const BATTLEFLY = {
  href: "battlefly",
  name: "BattleFly",
  image: "https://ipfs.io/ipfs/QmVSMdABd2hahtS74owdeu6nHauaXhWviReyMGch8Ztb6W",
  description:
    "BattleFly is an experimental PVP/P2E strategy game, powered by $MAGIC.",
  related: ["battlefly-v1-founders-nft", "battlefly-v2-founders-nft"],
  ...BATTLEFLY_DATA,
} as CollectionData;

const BATTLEFLY_FOUNDERS_V1 = {
  href: "battlefly-v1-founders-nft",
  name: "BattleFly v1 Founders NFT",
  image: "https://ipfs.io/ipfs/QmchD7t3B6PigLsDdKvAVH8bkLVmgpvWbAiAacuSiQGGKy",
  description:
    "BattleFly is an experimental PVP/P2E strategy game, powered by $MAGIC.",
  related: ["battlefly", "battlefly-v2-founders-nft"],
  ...BATTLEFLY_DATA,
} as const;

const BATTLEFLY_FOUNDERS_V2 = {
  href: "battlefly-v2-founders-nft",
  name: "BattleFly v2 Founders NFT",
  image: "https://ipfs.io/ipfs/QmUVGissTKYFo9evbi96gVZXZXok9XJoZR3VZcEpMD89Kz",
  description:
    "BattleFly is an experimental PVP/P2E strategy game, powered by $MAGIC.",
  related: ["battlefly", "battlefly-v1-founders-nft"],
  ...BATTLEFLY_DATA,
} as const;

const BALANCER_CRYSTAL = {
  href: "balancer-crystal",
  name: "Balancer Crystal",
  image:
    "https://ipfs.io/ipfs/Qmd1hsvPDWrxtnfUna3pQyfmChyAkMenuziHS1gszM34P8/Balancer%20Crystal/1.jpg",
  description:
    "Exchange your SLP for one of these to further the fun in Bridgeworld and LIFE.",
  ...BRIDGEWORLD_DATA,
  cartridge: "bridgeworld-life",
  related: [
    "legion-genesis",
    "legion-auxiliary",
    "consumables",
    "treasures",
    "seed-of-life",
  ],
} as const;

const EXTRA_LIFE = {
  href: "extra-life",
  name: "Extra Life",
  image:
    "https://ipfs.io/ipfs/QmNaaRyyGK76iBqGenXVToGpozfAfeCfD64Hukwqr3y3VV/Extra%20LIFE.gif",
  description: "Extra Life was handed out to our OGs for sticking with us.",
} as const;

const KEYS = {
  href: "keys",
  name: "Keys",
  image:
    "https://ipfs.io/ipfs/QmNaaRyyGK76iBqGenXVToGpozfAfeCfD64Hukwqr3y3VV/Extra%20LIFE.gif",
  description: "Keys will unlock something or nothing at all.",
} as const;

const SMOL_BODIES_PETS = {
  href: "smol-bodies-pets",
  name: "Smol Bodies Pets",
  image:
    "https://ipfs.io/ipfs/Qmak8RVrMWWLEsGtTgVqUJ5a7kkouM2atjyynWT5qQCP2N/614.gif",
  description:
    "The Smol Bodies Pets are cute companions to accompany your Smol Body in Smolverse.",
  cartridge: "smolverse",
  related: ["smol-bodies", "smol-treasures"],
  tools: "smol-bodies-pets",
  website: "https://smolverse.lol",
} as const;

const SMOL_BRAINS_LAND = {
  href: "smol-brains-land",
  name: "Smol Brains Land",
  image:
    "https://ipfs.io/ipfs/QmUcEoYHwye65tsncGAtoz2bQLjQtrE2GiCa6L1PYNcbh7/0.png",
  description:
    "The Smol Brains Land was developed collectively while staking your Smol Brain.",
  cartridge: "smolverse",
  related: ["smol-brains", "smol-brains-pets", "smol-cars", "smol-treasures"],
  website: "https://smolverse.lol",
} as const;

const UNPILGRIMAGED_LEGION_AUXILIARY = {
  href: "unpilgrimaged-legion-auxiliary",
  name: "Unpilgrimaged Legion Auxiliary",
  image:
    "https://ipfs.io/ipfs/QmTd8siTE6Ys2XTLNerPySYQowdeDkZjSTViYpBf54GnXx/Siege.gif",
  description:
    "Unpilgrimaged Legions need to undergo Pilgrimage to participate in Bridgeworld.",
} as const;

const UNPILGRIMAGED_LEGION_GENESIS = {
  href: "unpilgrimaged-legion-genesis",
  name: "Unpilgrimaged Legion Genesis",
  image:
    "https://ipfs.io/ipfs/QmRqosGZZ6icx6uSDjLuFFMJiWDefZAiAZdpJdBK9BP5S4/All-Class%201.png",
  description:
    "Unpilgrimaged Legions need to undergo Pilgrimage to participate in Bridgeworld.",
} as const;

const SAMURISE_ITEMS = {
  href: "samurise-items",
  name: "SamuRise Items",
  image: "https://storage.googleapis.com/samurise/items/katana.png",
  related: ["samurise-land"],
  ...SAMURISE_DATA,
} as const;

const SAMURISE_LAND = {
  href: "samurise-land",
  name: "SamuRise Land",
  image: "https://storage.googleapis.com/samurise/land/land.gif",
  related: ["samurise-items"],
  ...SAMURISE_DATA,
} as const;

const KOTE_SQUIRES = {
  href: "kote-squires",
  name: "KOTE Squires",
  image:
    "https://ipfs.io/ipfs/QmYZXbjHrKSoy5ZPutJPnnuZURr6NLbVpd323HZ3G3sX9D/strengthG.png",
  description:
    "The support characters for Knights of the Ether, these 3,999 Squires quest on Arbitrum in search of $FIEF, potions, trinkets and rings. Each Squire comes in 1 of 4 classes, Strength, Wisdom, Luck or Faith. (You must own at least 1 Knight on L1 to send Squires out on Quests)",
  ...KOTE_DATA,
  related: ["kote-potions", "kote-trinkets", "kote-rings"],
} as const;

const KOTE_POTIONS = {
  href: "kote-potions",
  name: "KOTE Potions",
  image:
    "https://knightsoftheether.com/squires/images/potions/Phantom%20Phial.png",
  description:
    "1 of 3 item types in the Knights of the Ether ecosystem, Potions have 5 rarity tiers and 2 upgrade levels.",
  ...KOTE_DATA,
  related: ["kote-squires", "kote-trinkets", "kote-rings"],
} as const;

const KOTE_TRINKETS = {
  href: "kote-trinkets",
  name: "KOTE Trinkets",
  image:
    "https://knightsoftheether.com/squires/images/trinkets/Golem%20Eye.png",
  description:
    "1 of 3 item types in the Knights of the Ether ecosystem, Trinkets have 5 rarity tiers.",
  ...KOTE_DATA,
  related: ["kote-squires", "kote-potions", "kote-rings"],
} as const;

const KOTE_RINGS = {
  href: "kote-rings",
  name: "KOTE Rings",
  image:
    "https://knightsoftheether.com/squires/images/rings/Etheric%20Ring%20of%20Renewal.png",
  description:
    "1 of 3 item types in the Knights of the Ether ecosystem, Rings have 5 rarity tiers, 5 makes and 5 upgrade levels.",
  ...KOTE_DATA,
  related: ["kote-squires", "kote-potions", "kote-trinkets"],
} as const;

const SWOLERCYCLES = {
  href: "swolercycles",
  name: "Swolercycles",
  image:
    "https://ipfs.io/ipfs/QmUqm5andJ4u6HMTuvtMmhMKs6oskGceRgXruRnt19CNR4/3430.png",
  description: "Swols go vroom vroom.",
  cartridge: "smolverse",
  related: ["smol-bodies", "smol-bodies-pets", "smol-cars", "smol-treasures"],
  website: "https://smolverse.lol",
} as const;

// Used for homepage and opengraph
export const COLLECTION_METADATA = [
  {
    href: "legion-genesis",
    name: "Legion Genesis",
    image:
      "https://ipfs.io/ipfs/QmRXV7Pu2Y2CaeYGCSWJLKXnnRgDa3qndisPwGv9ZjQowt/Genesis/Rare/Shadowguard/4A.jpg",
    imageContain: true,
    imageBgColor: "#c80b00",
    description: "The Origin Legions of Bridgeworld with a fixed supply.",
    related: [
      "legion-auxiliary",
      "consumables",
      "treasures",
      "balancer-crystal",
    ],
    ...BRIDGEWORLD_DATA,
  },
  {
    href: "smol-brains",
    name: "Smol Brains",
    image:
      "https://ipfs.io/ipfs/QmY71ban6QoWg9nbNwikk6wVWknj8NFBG8nMGHEuzwfAwf/121/0.png",
    description:
      "The Smol Brains are a dynamic PFP of a monkey whose head gets bigger the larger its IQ becomes.",
    cartridge: "smolverse",
    related: [
      "smol-brains-land",
      "smol-brains-pets",
      "smol-cars",
      "smol-treasures",
    ],
    discord: "smolbrains",
    tools: "smol-brains",
    twitter: "SmolBrainsNFT",
    website: "https://smolverse.lol",
  },
  {
    href: "seed-of-life",
    name: "Seed of Life",
    image:
      "https://ipfs.io/ipfs/QmbkpUo9dPsTVDfttdgkV6eqbPLCXyoKhFBxhwdAgqB15z/Seed of Life 1.png",
    description:
      "Built atop the Magic ecosystem, Life embodies the metaverse as a living breathing ecosystem...",
    cartridge: "life",
    related: ["balancer-crystal", "treasures"],
    docs: "https://drive.google.com/file/d/1HwV-90u5TwffAvk83DIxfCKKLHfBAdmo/view",
    game: "https://life.treasure.lol",
    twitter: "LifeNFT_",
    discord: "treasuredao",
  },
  {
    href: "legion-auxiliary",
    name: "Legion Auxiliary",
    image:
      "https://ipfs.io/ipfs/QmRXV7Pu2Y2CaeYGCSWJLKXnnRgDa3qndisPwGv9ZjQowt/Auxiliary/Common/Fighter/2E.jpg",
    imageContain: true,
    imageBgColor: "#4bbdbd",
    description:
      "Descendants of Genesis Legions that can be summoned in Bridgeworld.",
    related: ["legion-genesis", "consumables", "treasures", "balancer-crystal"],
    ...BRIDGEWORLD_DATA,
  },
  {
    href: "treasures",
    name: "Treasures",
    image:
      "https://ipfs.io/ipfs/Qmd1hsvPDWrxtnfUna3pQyfmChyAkMenuziHS1gszM34P8/Treasures/97.jpg",
    description:
      "Treasures are composable building blocks in Bridgeworld that will be used inter- and intra-metaverse.",
    ...BRIDGEWORLD_DATA,
    cartridge: "bridgeworld-life",
    related: [
      "legion-genesis",
      "legion-auxiliary",
      "consumables",
      "balancer-crystal",
    ],
  },
  {
    href: "consumables",
    name: "Consumables",
    image:
      "https://ipfs.io/ipfs/Qmd1hsvPDWrxtnfUna3pQyfmChyAkMenuziHS1gszM34P8/Consumables/3.jpg",
    description:
      "Functional items that are crafted from Treasures and give utility in the Metaverse.",
    ...BRIDGEWORLD_DATA,
    related: [
      "legion-genesis",
      "legion-auxiliary",
      "treasures",
      "balancer-crystal",
    ],
  },
  {
    href: "smol-bodies",
    name: "Smol Bodies",
    image: smolBodiesImg.src,
    description:
      "The Smol Bodies inhabit a gym near you, stacking $plates to earn muscle and be not smol.",
    cartridge: "smolverse",
    related: ["smol-bodies-pets", "swolercycles", "smol-treasures"],
    discord: "smolbrains",
    tools: "smol-bodies",
    twitter: "SmolBodies",
    website: "https://smolverse.lol",
  },
  {
    href: "realm",
    name: "Realm",
    image: realmImg.src,
    description:
      "Realm is a decentralized world-building experience. Enjoy $MAGIC emissions and Loot from across the Metaverse.",
    cartridge: "ecosystem",
    docs: "https://docs.rlm.land",
    discord: "realmdao",
    game: "https://rlm.land/app",
    twitter: "RealmDao",
    website: "https://rlm.land",
  },
  {
    href: "smithonia-weapons",
    name: "Smithonia Weapons",
    image:
      "https://ipfs.io/ipfs/bafkreibzmyesy7amoir273ckdcnpndkaz4b3ljdpc6lgexv2abzfnuieq4",
    ...SMITHONIA_DATA,
    related: ["smithonia-resources"],
  },
  {
    href: "tales-of-elleria",
    name: "Tales of Elleria",
    image:
      "https://ipfs.io/ipfs/Qmd66PRkYUWN78VUSzYyxmZeP4zLpC8Wroif3QNCyofvj7",
    description:
      "Tales of Elleria is an immersive three-dimensional role-playing GameFi project. Summon heroes, take on assignments, go on quests and epic adventures to battle dangerous monsters earn tremendous rewards.",
    ...TALES_OF_ELLERIA_DATA,
    related: ["tales-of-elleria-relics"],
  },
  {
    href: "tales-of-elleria-relics",
    name: "Tales of Elleria Relics",
    image: talesOfElleriaRelicsImg.src,
    description:
      "Relics are functional objects used mainly in Tales of Elleria. Obtainable from various in-game sources, they can crafted and used on your heroes and equipment and for various other purposes...",
    ...TALES_OF_ELLERIA_DATA,
    related: ["tales-of-elleria"],
  },
  {
    href: "peek-a-boo",
    name: "Peek-A-Boo",
    image: peekabooImg.src,
    description:
      "Peek-A-Boo is a collection of 10,000 adorable NFTs. There are two types, Ghosts and Busters.",
    cartridge: "ecosystem",
    docs: "https://www.peekaboonft.io/ghostpaper",
    discord: "peekaboo",
    game: "https://www.peekaboonft.io/hide-n-seek",
    twitter: "PeekABooGameNFT",
    website: "https://www.peekaboonft.io",
  },
  {
    href: "smol-brains-pets",
    name: "Smol Brains Pets",
    image:
      "https://ipfs.io/ipfs/QmdRyjjv6suTcS9E1aNnKRhvL2McYynrzLbg5VwXH8cCQB/614.gif",
    description:
      "The Smol Brains Pets are cute companions to accompany your Smol Brain in Smolverse.",
    cartridge: "smolverse",
    related: ["smol-brains", "smol-brains-land", "smol-cars", "smol-treasures"],
    tools: "smol-brains-pets",
    website: "https://smolverse.lol",
  },
  {
    href: "smol-cars",
    name: "Smol Cars",
    image:
      "https://ipfs.io/ipfs/QmVjjJJ7XQKRbM5uBmDtTP9r22UZC1Wv55AT9p4yGecHpP/30.png",
    description:
      "The Smol Cars are here to get you around in Smolverse. Vroom vroom.",
    cartridge: "smolverse",
    related: [
      "smol-brains",
      "smol-brains-land",
      "smol-brains-pets",
      "smol-treasures",
    ],
    tools: "smol-cars",
    website: "https://smolverse.lol",
  },
  {
    href: "smol-treasures",
    name: "Smol Treasures",
    image:
      "https://ipfs.io/ipfs/QmZK1i4y7qn7Fi7mEMgT4KZcb1Etb12yndcTZ5dnhigDPt/2.gif",
    description: "Smol Treasures were farmed by Smols and Swols on the moon.",
    cartridge: "smolverse",
    related: ["smol-brains", "smol-bodies"],
    website: "https://smolverse.lol",
  },
] as Array<CollectionData>;

export const ALL_COLLECTION_METADATA = [
  TOADSTOOLZ,
  {
    ...TOADSTOOLZ,
    image: toadstoolzItemzImg.src,
    href: "toadstoolz-itemz",
    name: "Toadstoolz Itemz",
    related: ["toadstoolz"],
    tools: undefined,
  },
  BATTLEFLY,
  BATTLEFLY_FOUNDERS_V1,
  BATTLEFLY_FOUNDERS_V2,
  KOTE_SQUIRES,
  KOTE_POTIONS,
  KOTE_RINGS,
  KOTE_TRINKETS,
  SAMURISE_LAND,
  SAMURISE_ITEMS,
  ...COLLECTION_METADATA,
  {
    href: "smithonia-resources",
    name: "Smithonia Resources",
    image:
      "https://ipfs.io/ipfs/bafkreiellqodl7qzr57fizmzxxtsuwx72tnatpkeniecjdpp2ld73ezwu4",
    ...SMITHONIA_DATA,
    related: ["smithonia-weapons"],
  },
  EXTRA_LIFE,
  BALANCER_CRYSTAL,
  KEYS,
  SMOL_BODIES_PETS,
  SMOL_BRAINS_LAND,
  UNPILGRIMAGED_LEGION_AUXILIARY,
  UNPILGRIMAGED_LEGION_GENESIS,
  SWOLERCYCLES,
  LOST_DONKEYS,
] as Array<CollectionData>;

// Used on collection detail page
export const COLLECTION_DESCRIPTIONS = {
  battlefly:
    "BattleFly is an experimental PVP/P2E strategy game, powered by $MAGIC.",
  "legion-genesis": "The Origin Legions of Bridgeworld with a fixed supply.",
  "legion-auxiliary":
    "Descendants of Genesis Legions that can be summoned in Bridgeworld.",
  "peek-a-boo":
    "Peek-A-Boo is a P2E ecosystem having trait customization, unique tokenomics, and competition-focused roadmaps. Our Hide-N-Seek game is the first of many to be onboarded into the Spoopy Metaverse!",
  "smol-bodies":
    "The Smol Bodies inhabit a gym near you, stacking $plates to earn muscle and be not smol.",
  "smol-brains":
    "The Smol Brains are a dynamic PFP of a monkey whose head gets bigger the larger its IQ becomes.",
  "smol-brains-pets":
    "The Smol Brains Pets are cute companions to accompany your Smol Brain in Smolverse.",
  "seed-of-life":
    "Built atop the Magic ecosystem, Life embodies the metaverse as a living breathing ecosystem...",
  "smol-cars":
    "The Smol Cars are here to get you around in Smolverse. Vroom vroom.",
  treasures:
    "Treasures are composable building blocks in Bridgeworld that will be used inter- and intra-metaverse.",
  "smol-treasures":
    "Smol Treasures were farmed by Smols and Swols on the moon.",
  consumables:
    "Functional items that are crafted from Treasures and give utility in the Metaverse.",
  realm:
    "Realm is a decentralized world-building experience. Enjoy $MAGIC emissions and Loot from across the Metaverse.",
  "tales-of-elleria":
    "Tales of Elleria is an immersive three-dimensional role-playing GameFi project built on Arbitrum One. Summon heroes, take on assignments, go on quests and epic adventures to battle dangerous monsters earn tremendous rewards.",
  "tales-of-elleria-relics":
    "Relics are functional objects used mainly in Tales of Elleria. Obtainable from various in-game sources, they can crafted and used on your heroes and equipment and for various other purposes...",
  toadstoolz:
    "Toadstoolz is an on-chain toad life simulation NFT game. Toadz love to hunt for $BUGZ, go on adventures and are obsessed with collecting NFTs.",
  "toadstoolz-itemz":
    "Toadstoolz is an on-chain toad life simulation NFT game. Toadz love to hunt for $BUGZ, go on adventures and are obsessed with collecting NFTs.",
  ...ALL_COLLECTION_METADATA.filter((item) =>
    [
      "SamuRise Items",
      "SamuRise Land",
      "Smithonia Resources",
      "Smithonia Weapons",
      "KOTE Squires",
      "KOTE Rings",
      "KOTE Potions",
      "KOTE Trinkets",
      "Swolercycles",
      "The Lost Donkeys",
    ].includes(item.name)
  ).reduce((acc, item) => {
    acc[item.href] = item.description;

    return acc;
  }, {}),
} as const;

export const DAO_FEE = "0.025";
export const DEFAULT_COLLECTION_FEE = "0.025";

export const BATTLEFLY_METADATA = {
  battleflies: {
    name: "Cocoon",
    description: "Ordinary cocoon, what's inside?",
    image:
      "https://ipfs.infura.io/ipfs/QmecUwQADn2yd2tNBoVvWLuknYMxY8WLnWVfATHG452VJP",
    attributes: [
      {
        trait_type: "Type",
        value: "Genesis",
      },
      {
        trait_type: "Class",
        value: "Original",
      },
    ],
  },
  specials: {
    name: "v1 Founder",
    description:
      "BattleFly v1 Founders NFT represents ownership of the BattleFly Game. There is only 220 NFT in circulation.",
    image:
      "https://ipfs.infura.io/ipfs/QmXsiziZsoYEz5sqz7rHCYdtuqaBPrpQbn7UnuUpcf2n6Z",
    attributes: [],
  },
};
