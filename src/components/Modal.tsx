import * as React from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XIcon } from "@heroicons/react/outline";

type ModalProps = {
  onClose: () => void;
  isOpen: boolean;
  title?: string;
  hideCloseIcon?: boolean;
  children: React.ReactNode;
  className?: string;
  zIndex?: string;
};

export const Modal = React.forwardRef<HTMLElement, ModalProps>(
  (
    {
      onClose,
      isOpen,
      title,
      children,
      className,
      hideCloseIcon,
      zIndex = "30",
    },
    ref
  ) => {
    return (
      <Transition.Root show={isOpen} as={React.Fragment}>
        <Dialog
          as="div"
          className={`fixed z-${zIndex} inset-0 overflow-y-auto`}
          onClose={onClose}
          initialFocus={
            ref as React.MutableRefObject<HTMLElement | null> | undefined
          }
        >
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </Transition.Child>

            {/* This element is to trick the browser into centering the modal contents. */}
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <div
                className={`inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6 ${className}`}
              >
                {!hideCloseIcon && (
                  <div className="hidden sm:block absolute top-0 right-0 pt-4 pr-4">
                    <button
                      type="button"
                      className="bg-white dark:bg-gray-800 rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      onClick={onClose}
                    >
                      <span className="sr-only">Close</span>
                      <XIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>
                )}
                <div className="mt-3 text-center sm:mt-0 sm:text-left">
                  {title && (
                    <Dialog.Title
                      as="h3"
                      className="leading-6 font-medium text-gray-900 dark:text-gray-300 sm:text-lg text-sm"
                    >
                      {title}
                    </Dialog.Title>
                  )}
                  {children}
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
    );
  }
);

Modal.displayName = "Modal";
