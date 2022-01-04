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
          ? generateIpfsLink(token.metadata.image)
          : token.metadata?.image ?? "")
      }
      layout={Boolean(props.width) ? undefined : "fill"}
      {...props}
    />
  );
}
