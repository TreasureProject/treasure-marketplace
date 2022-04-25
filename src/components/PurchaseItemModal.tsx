import * as React from "react";
import { shortenAddress, useEthers, useTokenAllowance } from "@usedapp/core";
import { targetNftT } from "../types";
import {
  useApproveMagic,
  useBuyItem,
  useChainId,
  useCollection,
} from "../lib/hooks";
import { useMagic } from "../context/magicContext";
import ImageWrapper from "./ImageWrapper";
import { Modal } from "./Modal";
import { Contracts, DAO_FEE } from "../const";
import { TokenStandard } from "../../generated/marketplace.graphql";
import Button from "./Button";
import { formatEther } from "ethers/lib/utils";
import { BigNumber } from "@ethersproject/bignumber";
import { AddressZero } from "@ethersproject/constants";
import { CurrencySwitcher } from "./CurrencySwitcher";
import { formatPercent } from "../utils";

export const PurchaseItemModal = ({
  address,
  isOpen,
  onClose,
  targetNft,
}: {
  address: string;
  isOpen: boolean;
  onClose: () => void;
  targetNft: targetNftT;
}) => {
  const [quantity, setQuantity] = React.useState(1);
  const { account } = useEthers();
  const { metadata, payload, collection } = targetNft;
  const chainId = useChainId();
  const { send, state } = useBuyItem();
  const { magicBalance, setSushiModalOpen } = useMagic();

  React.useEffect(() => {
    if (state.status === "Success") {
      onClose();
    }
  }, [onClose, state.status]);

  const normalizedAddress = address.slice(0, 42);
  const { fee } = useCollection(normalizedAddress);

  const totalPrice =
    quantity * Number(parseFloat(formatEther(targetNft.payload.pricePerItem)));

  const canPurchase = magicBalance.gte(
    BigNumber.from(targetNft.payload.pricePerItem).mul(quantity)
  );

  const { send: approve, state: approveState } = useApproveMagic();

  const magicAllowance = useTokenAllowance(
    Contracts[chainId].magic,
    account ?? AddressZero,
    Contracts[chainId].marketplace
  );

  const buttonRef = React.useRef() as React.MutableRefObject<HTMLButtonElement>;

  const notAllowed = magicAllowance?.isZero() ?? true;

  return (
    <Modal
      onClose={onClose}
      isOpen={isOpen}
      title="Order Summary"
      ref={buttonRef}
    >
      <div className="sm:mt-10 lg:mt-0">
        <div className="sm:mt-4">
          <h3 className="sr-only">Items in your cart</h3>
          <ul role="list" className="divide-y divide-gray-200">
            <li
              key={payload.id}
              className="flex flex-col sm:flex-row py-6 px-4 sm:px-6"
            >
              <div className="flex-shrink-0">
                <ImageWrapper
                  height="50%"
                  token={{
                    name: targetNft.metadata?.name,
                    metadata: targetNft.metadata?.image
                      ? {
                          description: targetNft.metadata?.description ?? "",
                          image: targetNft.metadata.image,
                        }
                      : null,
                  }}
                  width="50%"
                />
              </div>

              <div className="sm:ml-6 sm:space-y-0 mt-2 sm:mt-0 space-y-2 flex-1 flex flex-col">
                <div className="flex">
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm">
                      <p className="text-sm text-gray-500 dark:text-gray-400 uppercase">
                        {collection}
                      </p>
                      <p className="mt-1 font-medium text-gray-800 dark:text-gray-50">
                        {metadata?.name ?? ""}
                      </p>
                      <p className="mt-2 text-gray-400 dark:text-gray-500 text-xs">
                        <span className="text-gray-500 dark:text-gray-400">
                          Sold by:
                        </span>{" "}
                        {shortenAddress(payload.seller.id)}
                      </p>
                    </h4>
                  </div>
                </div>

                {payload.standard === TokenStandard.ERC1155 && (
                  <div className="flex-1 pt-4 flex items-end justify-between">
                    <p className="mt-1 text-xs font-medium text-gray-900 dark:text-gray-100">
                      {formatEther(payload.pricePerItem)} $MAGIC{" "}
                      <span className="text-[0.5rem] text-gray-500 dark:text-gray-400">
                        Per Item
                      </span>
                    </p>

                    <div className="flex flex-col items-end space-y-1 ml-4">
                      <button
                        className="text-gray-500 dark:text-gray-400 transition-colors duration-300 motion-reduce:transition-none hover:text-red-500"
                        onClick={() => setQuantity(Number(payload.quantity))}
                      >
                        Max
                      </button>
                      <label htmlFor="quantity" className="sr-only">
                        Quantity
                      </label>
                      <select
                        id="quantity"
                        name="quantity"
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        className="form-select rounded-md border dark:text-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 dark:focus:ring-gray-300 dark:focus:border-gray-300 text-base font-medium text-gray-700 text-left shadow-sm focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 sm:text-sm"
                      >
                        {Array.from({
                          length: Number(payload.quantity) || 0,
                        }).map((_, idx) => (
                          <option key={idx} value={idx + 1}>
                            {idx + 1}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </li>
          </ul>
          <dl className="py-6 px-4 space-y-6 sm:px-6">
            <div className="flex items-center justify-between border-t border-gray-200 pt-6">
              <dt className="text-base font-medium">
                <ul>
                  <li>Total</li>
                  <li className="text-gray-400 text-sm">
                    Creator fee ({formatPercent(fee)})
                  </li>
                  <li className="text-gray-400 text-sm">
                    DAO fee ({formatPercent(DAO_FEE)})
                  </li>
                </ul>
              </dt>
              <dd className="text-base font-medium text-gray-900 dark:text-gray-100 flex flex-col items-end">
                <p>{totalPrice} $MAGIC</p>
                <p className="text-gray-500 text-sm mt-1">
                  ≈ <CurrencySwitcher price={totalPrice} />
                </p>
              </dd>
            </div>
          </dl>

          <div className="border-t border-gray-200 py-6 px-4 sm:px-6">
            {notAllowed ? (
              <Button
                ref={buttonRef}
                onClick={approve}
                isLoading={approveState.status === "Mining"}
                loadingText="Approving $MAGIC..."
                variant="secondary"
              >
                Approve $MAGIC to purchase this item
              </Button>
            ) : (
              <>
                <Button
                  ref={buttonRef}
                  disabled={!canPurchase || state.status === "Mining"}
                  isLoading={state.status === "Mining"}
                  loadingText="Confirming order..."
                  onClick={() => {
                    send(
                      targetNft,
                      normalizedAddress,
                      payload.seller.id,
                      Number(payload.tokenId),
                      quantity,
                      payload.pricePerItem
                    );
                  }}
                >
                  {canPurchase
                    ? "Confirm order"
                    : "You have insufficient funds"}
                </Button>
                {!canPurchase && (
                  <button
                    className="mt-4 text-xs w-full m-auto text-red-500 underline"
                    onClick={() => {
                      onClose();
                      setSushiModalOpen(true);
                    }}
                  >
                    Purchase MAGIC on SushiSwap
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
