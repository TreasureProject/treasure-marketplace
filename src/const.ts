import { ChainId } from "@usedapp/core";
import smolBodiesImg from "../public/img/smolbodies.png";
import toadstoolzImg from "../public/img/toadstoolz.jpg";
import peekabooImg from "../public/img/peekaboo.svg";
import realmImg from "../public/img/realm.png";

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
  "Smol Treasures",
];

export const METADATA_COLLECTIONS = [
  "KOTE Squires",
  "Peek-A-Boo",
  "SamuRise Land",
  "Tales of Elleria",
  "Toadstoolz",
  "Toadstoolz Itemz",
];

export const TOADSTOOLZ = {
  href: "toadstoolz",
  name: "Toadstoolz",
  image: toadstoolzImg.src,
  description:
    "Toadstoolz is an on-chain toad life simulation game. Toadz love to hunt for $BUGZ and go on adventures.",
} as const;

export const BATTLEFLY = {
  href: "battlefly",
  name: "BattleFly",
  image: "https://ipfs.io/ipfs/QmVSMdABd2hahtS74owdeu6nHauaXhWviReyMGch8Ztb6W",
  description:
    "BattleFly is an experimental PVP/P2E strategy game, powered by $MAGIC.",
} as const;

const BATTLEFLY_FOUNDERS_V1 = {
  href: "battlefly-v1-founders-nft",
  name: "BattleFly v1 Founders NFT",
  image: "https://ipfs.io/ipfs/QmchD7t3B6PigLsDdKvAVH8bkLVmgpvWbAiAacuSiQGGKy",
  description:
    "BattleFly is an experimental PVP/P2E strategy game, powered by $MAGIC.",
} as const;

const BATTLEFLY_FOUNDERS_V2 = {
  href: "battlefly-v2-founders-nft",
  name: "BattleFly v2 Founders NFT",
  image: "https://ipfs.io/ipfs/QmUVGissTKYFo9evbi96gVZXZXok9XJoZR3VZcEpMD89Kz",
  description:
    "BattleFly is an experimental PVP/P2E strategy game, powered by $MAGIC.",
} as const;

const BALANCER_CRYSTAL = {
  href: "balancer-crystal",
  name: "Balancer Crystal",
  image:
    "https://ipfs.io/ipfs/QmZxhxnzWZbhYDiBeoqHgGyBKefPkHaFYa2hqFFyhfa99S/Balancer%20Crystal.gif",
  description:
    "Exchange your SLP for one of these to further the fun in Bridgeworld and LIFE.",
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
    "https://ipfs.io/ipfs/QmdRyjjv6suTcS9E1aNnKRhvL2McYynrzLbg5VwXH8cCQB/614.gif",
  description:
    "The Smol Bodies Pets are cute companions to accompany your Smol Body in Smolverse.",
} as const;

const SMOL_BRAINS_LAND = {
  href: "smol-brains-land",
  name: "Smol Brains Land",
  image:
    "https://ipfs.io/ipfs/QmUcEoYHwye65tsncGAtoz2bQLjQtrE2GiCa6L1PYNcbh7/0.png",
  description:
    "The Smol Brains Land was developed collectively while staking your Smol Brain.",
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

const SAMURISE_LAND = {
  href: "samurise-land",
  name: "SamuRise Land",
  image: "https://storage.googleapis.com/samurise/land/land.gif",
  description:
    "The Lost SamuRise is a faction based strategy game played in the fictional world of Tengoku (heaven) that has borrowed lore and stylistic elements from Samurai culture in classical Japan.",
} as const;

const KOTE_SQUIRES = {
  href: "kote-squires",
  name: "KOTE Squires",
  image:
    "https://ipfs.io/ipfs/QmYZXbjHrKSoy5ZPutJPnnuZURr6NLbVpd323HZ3G3sX9D/strengthG.png",
  description:
    "The support characters for Knights of the Ether, these 3,999 Squires quest on Arbitrum in search of $FIEF, potions, trinkets and rings. Each Squire comes in 1 of 4 classes, Strength, Wisdom, Luck or Faith.",
} as const;

// Used for homepage and opengraph
export const COLLECTION_METADATA = [
  {
    href: "legion-genesis",
    name: "Legion Genesis",
    image:
      "https://ipfs.io/ipfs/QmRqosGZZ6icx6uSDjLuFFMJiWDefZAiAZdpJdBK9BP5S4/Warlock.png",
    description: "The Origin Legions of Bridgeworld with a fixed supply.",
  },
  {
    href: "smol-brains",
    name: "Smol Brains",
    image:
      "https://ipfs.io/ipfs/QmY71ban6QoWg9nbNwikk6wVWknj8NFBG8nMGHEuzwfAwf/121/0.png",
    description:
      "The Smol Brains are a dynamic PFP of a monkey whose head gets bigger the larger its IQ becomes.",
  },
  {
    href: "seed-of-life",
    name: "Seed of Life",
    image:
      "https://ipfs.io/ipfs/QmbkpUo9dPsTVDfttdgkV6eqbPLCXyoKhFBxhwdAgqB15z/Seed of Life 1.png",
    description:
      "Built atop the Magic ecosystem, Life embodies the metaverse as a living breathing ecosystem...",
  },
  {
    href: "legion-auxiliary",
    name: "Legion Auxiliary",
    image:
      "https://ipfs.io/ipfs/QmTxcMUqVvrHMrdLUqtSjFSbHZ4ZoQ2bUB6U7CEpA7JDiF/Uncommon Fighter.gif",
    description:
      "Descendants of Genesis Legions that can be summoned in Bridgeworld.",
  },
  {
    href: "treasures",
    name: "Treasures",
    image:
      "https://ipfs.io/ipfs/Qmbyy8EWMzrSTSGG1bDNsYZfvnkcjAFNM5TXJqvsbuY8Dz/Honeycomb.gif",
    description:
      "Treasures are composable building blocks in Bridgeworld that will be used inter- and intra-metaverse.",
  },
  {
    href: "consumables",
    name: "Consumables",
    image:
      "https://ipfs.io/ipfs/QmdpMJMTRrGu1Z43RF94WnDRj5QwiLJXo43TwKWPX2cTWE/Medium Prism.gif",
    description:
      "Functional items that are crafted from Treasures and give utility in the Metaverse.",
  },
  {
    href: "smol-bodies",
    name: "Smol Bodies",
    image: smolBodiesImg.src,
    description:
      "The Smol Bodies inhabit a gym near you, stacking $plates to earn muscle and be not smol.",
  },
  {
    href: "smithonia-weapons",
    name: "Smithonia Weapons",
    image:
      "https://ipfs.io/ipfs/bafkreibzmyesy7amoir273ckdcnpndkaz4b3ljdpc6lgexv2abzfnuieq4",
    description:
      "Smithonia is a SmithyDAO project. It's a world of staking and adventure which supports a hybrid economy where the primary objective of the game is to build the rarity of your weapon through gameplay.",
  },
  {
    href: "tales-of-elleria",
    name: "Tales of Elleria",
    image:
      "https://ipfs.io/ipfs/Qmd66PRkYUWN78VUSzYyxmZeP4zLpC8Wroif3QNCyofvj7",
    description:
      "Tales of Elleria is an immersive three-dimensional role-playing GameFi project. Summon heroes, take on assignments, go on quests and epic adventures to battle dangerous monsters earn tremendous rewards.",
  },
  {
    href: "peek-a-boo",
    name: "Peek-A-Boo",
    image: peekabooImg.src,
    description:
      "Peek-A-Boo is a collection of 10,000 adorable NFTs. There are two types, Ghosts and Busters.",
  },
  {
    href: "realm",
    name: "Realm",
    image: realmImg.src,
    description:
      "Realm is a decentralized world-building experience. Enjoy $MAGIC emissions and Loot from across the Metaverse.",
  },
  {
    href: "smol-brains-pets",
    name: "Smol Brains Pets",
    image:
      "https://ipfs.io/ipfs/QmdRyjjv6suTcS9E1aNnKRhvL2McYynrzLbg5VwXH8cCQB/614.gif",
    description:
      "The Smol Brains Pets are cute companions to accompany your Smol Brain in Smolverse.",
  },
  {
    href: "smol-cars",
    name: "Smol Cars",
    image:
      "https://ipfs.io/ipfs/QmVjjJJ7XQKRbM5uBmDtTP9r22UZC1Wv55AT9p4yGecHpP/30.png",
    description:
      "The Smol Cars are here to get you around in Smolverse. Vroom vroom.",
  },

  {
    href: "smol-treasures",
    name: "Smol Treasures",
    image:
      "https://ipfs.io/ipfs/QmZK1i4y7qn7Fi7mEMgT4KZcb1Etb12yndcTZ5dnhigDPt/2.gif",
    description:
      "Smols and Swols are currently farming Smol treasures on the moon.",
  },
] as Array<Record<"description" | "href" | "image" | "name", string>>;

export const ALL_COLLECTION_METADATA = [
  ...COLLECTION_METADATA,
  BATTLEFLY,
  TOADSTOOLZ,
  { ...TOADSTOOLZ, href: "toadstoolz-itemz", name: "Toadstoolz Itemz" },
  EXTRA_LIFE,
  BALANCER_CRYSTAL,
  BATTLEFLY_FOUNDERS_V1,
  BATTLEFLY_FOUNDERS_V2,
  KEYS,
  SMOL_BODIES_PETS,
  SMOL_BRAINS_LAND,
  UNPILGRIMAGED_LEGION_AUXILIARY,
  UNPILGRIMAGED_LEGION_GENESIS,
  SAMURISE_LAND,
  KOTE_SQUIRES,
] as const;

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
  "seed-of-Life":
    "Built atop the Magic ecosystem, Life embodies the metaverse as a living breathing ecosystem...",
  "smol-cars":
    "The Smol Cars are here to get you around in Smolverse. Vroom vroom.",
  treasures:
    "Treasures are composable building blocks in Bridgeworld that will be used inter- and intra-metaverse.",
  "smol-treasures":
    "Smols and Swols are currently farming Smol treasures on the moon.",
  consumables:
    "Functional items that are crafted from Treasures and give utility in the Metaverse.",
  realm:
    "Realm is a decentralized world-building experience. Enjoy $MAGIC emissions and Loot from across the Metaverse.",
  "smithonia-weapons":
    "Smithonia is a SmithyDAO project. It's a world of staking and adventure which supports a hybrid economy where the primary objective of the game is to build the rarity of your weapon through gameplay.",
  "tales-of-elleria":
    "Tales of Elleria is an immersive three-dimensional role-playing GameFi project built on Arbitrum One. Summon heroes, take on assignments, go on quests and epic adventures to battle dangerous monsters earn tremendous rewards.",
  toadstoolz:
    "Toadstoolz is an on-chain toad life simulation NFT game. Toadz love to hunt for $BUGZ, go on adventures and are obsessed with collecting NFTs.",
  "toadstoolz-itemz":
    "Toadstoolz is an on-chain toad life simulation NFT game. Toadz love to hunt for $BUGZ, go on adventures and are obsessed with collecting NFTs.",
  ...ALL_COLLECTION_METADATA.filter((item) =>
    ["SamuRise Land", "KOTE Squires"].includes(item.name)
  ).reduce((acc, item) => {
    acc[item.href] = item.description;

    return acc;
  }, {}),
} as const;

export const FEE = 0.05;
export const USER_SHARE = 1 - FEE;

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

export const SMITHONIA_WEAPONS_METADATA = {
  name: "Smithonia Weapon",
  description: "Smithonia Weapons",
  image:
    "https://bafkreibzmyesy7amoir273ckdcnpndkaz4b3ljdpc6lgexv2abzfnuieq4.ipfs.nftstorage.link/",
  attributes: [],
};
