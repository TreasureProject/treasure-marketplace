import Image from "next/image";
import { generateIpfsLink } from "../utils";

type ImageWrapperProps = Pick<
  JSX.IntrinsicElements["img"],
  "aria-hidden" | "className" | "height" | "width"
> & {
  src?: string;
  token: {
    name?: string | null;
    metadata?: {
      description: string;
      image: string;
    } | null;
  };
};

export default function ImageWrapper({
  src,
  token,
  ...props
}: ImageWrapperProps) {
  return (
    <Image
      alt={token.name ?? ""}
      src={
        src ??
        (token.metadata?.description === "Smol Brains Land"
          ? generateIpfsLink(
              "ipfs://QmUcEoYHwye65tsncGAtoz2bQLjQtrE2GiCa6L1PYNcbh7/0.png"
            )
          : token.metadata?.image.includes("ipfs")
          ? generateIpfsLink(
              token.metadata.image.replace(
                "QmUqm5andJ4u6HMTuvtMmhMKs6oskGceRgXruRnt19CNR4",
                "QmdbpWQ9tFdYQxjwktyYXNA86w8KG3vpbtmBWNrnzsdHyz"
              )
            )
          : token.metadata?.image ?? "")
      }
      objectFit="contain"
      layout={Boolean(props.width) ? undefined : "fill"}
      {...props}
    />
  );
}
