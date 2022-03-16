// From https://react-spectrum.adobe.com/react-aria/useComboBox.html#dynamic-collections

import * as React from "react";
import type { ComboBoxProps } from "@react-types/combobox";
import type { AriaListBoxOptions } from "@react-aria/listbox";
import {
  useComboBoxState,
  useSearchFieldState,
  ListState,
} from "react-stately";
import type { Node } from "@react-types/shared";
import {
  useComboBox,
  useButton,
  useSearchField,
  useOverlay,
  DismissButton,
  FocusScope,
  useListBox,
  useListBoxSection,
  useOption,
} from "react-aria";
import { SearchIcon, XIcon } from "@heroicons/react/solid";
import { Spinner } from "./Spinner";
import classNames from "clsx";

interface ListBoxProps extends AriaListBoxOptions<unknown> {
  listBoxRef?: React.RefObject<HTMLUListElement>;
  state: ListState<unknown>;
}

interface SectionProps {
  section: Node<unknown>;
  state: ListState<unknown>;
}

interface OptionProps {
  item: Node<unknown>;
  state: ListState<unknown>;
}

interface PopoverProps {
  popoverRef?: React.RefObject<HTMLDivElement>;
  children: React.ReactNode;
  hasItems: boolean;
  isOpen?: boolean;
  onClose: () => void;
}

function ListBox(props: ListBoxProps) {
  const ref = React.useRef<HTMLUListElement>(null);
  const { listBoxRef = ref, state } = props;
  const { listBoxProps } = useListBox(props, state, listBoxRef);

  return (
    <ul
      {...listBoxProps}
      ref={listBoxRef}
      className="max-h-72 overflow-auto outline-none"
    >
      {[...state.collection].map((item) =>
        item.type === "section" ? (
          <ListBoxSection key={item.key} section={item} state={state} />
        ) : (
          <Option key={item.key} item={item} state={state} />
        )
      )}
    </ul>
  );
}

function ListBoxSection({ section, state }: SectionProps) {
  const { itemProps, headingProps, groupProps } = useListBoxSection({
    heading: section.rendered,
    "aria-label": section["aria-label"],
  });

  return (
    <>
      <li {...itemProps} className="pt-2">
        {section.rendered && (
          <span
            {...headingProps}
            className="text-xs font-bold uppercase text-gray-500 mx-3"
          >
            {section.rendered}
          </span>
        )}
        <ul {...groupProps}>
          {[...section.childNodes].map((node) => (
            <Option key={node.key} item={node} state={state} />
          ))}
        </ul>
      </li>
    </>
  );
}

function Option({ item, state }: OptionProps) {
  const ref = React.useRef<HTMLLIElement>(null);
  const { optionProps } = useOption(
    {
      key: item.key,
    },
    state,
    ref
  );

  return (
    <li
      {...optionProps}
      ref={ref}
      className={classNames(
        "m-1 rounded-md py-2 px-2 text-sm outline-none cursor-default flex items-center justify-between text-gray-700 dark:text-gray-200",
        optionProps["aria-disabled"] === true
          ? null
          : "dark:hover:bg-gray-800 hover:bg-red-500 hover:text-white"
      )}
    >
      {item.rendered}
    </li>
  );
}

function Popover(props: PopoverProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const { popoverRef = ref, isOpen, onClose, children } = props;

  // Handle events that should cause the popup to close,
  // e.g. blur, clicking outside, or pressing the escape key.
  const { overlayProps } = useOverlay(
    {
      isOpen,
      onClose,
      shouldCloseOnBlur: true,
      isDismissable: false,
    },
    popoverRef
  );

  // Add a hidden <DismissButton> component at the end of the popover
  // to allow screen reader users to dismiss the popup easily.
  return (
    <FocusScope restoreFocus>
      <div
        {...overlayProps}
        ref={popoverRef}
        className={classNames(
          "absolute z-10 top-full w-full shadow-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md mt-2",
          props.hasItems ? "border" : "border-0"
        )}
      >
        {children}
        <DismissButton onDismiss={onClose} />
      </div>
    </FocusScope>
  );
}

interface Props<T> extends ComboBoxProps<T> {
  placeholder?: string;
  isLoading?: boolean;
}

export function SearchAutocomplete<T extends object>(props: Props<T>) {
  const state = useComboBoxState({
    ...props,
    allowsEmptyCollection: true,
    menuTrigger: "focus",
  });

  const inputRef = React.useRef(null);
  const listBoxRef = React.useRef(null);
  const popoverRef = React.useRef(null);

  const { inputProps, listBoxProps } = useComboBox(
    {
      ...props,
      inputRef,
      listBoxRef,
      popoverRef,
    },
    state
  );

  // Get props for the clear button from useSearchField
  const searchProps = {
    label: props.label,
    value: state.inputValue,
    onChange: (v: string) => state.setInputValue(v),
  };

  const searchState = useSearchFieldState(searchProps);
  const { clearButtonProps } = useSearchField(
    searchProps,
    searchState,
    inputRef
  );
  const clearButtonRef = React.useRef(null);
  const { buttonProps } = useButton(clearButtonProps, clearButtonRef);

  return (
    <div className="inline-flex flex-col relative w-full">
      <div
        className={`relative px-2 inline-flex bg-white dark:bg-black flex-row items-center rounded-md overflow-hidden shadow-sm border ${
          state.isFocused
            ? "border-red-500 dark:border-gray-200"
            : "border-gray-300 dark:border-gray-500"
        }`}
      >
        <SearchIcon aria-hidden="true" className="w-5 h-5 text-gray-500" />
        <input
          {...inputProps}
          ref={inputRef}
          placeholder={props.placeholder ?? "Search Collection..."}
          className="outline-none px-3 py-1 appearance-none w-full dark:bg-black dark:placeholder-gray-400 dark:text-gray-200"
        />
        {props.isLoading ? (
          <button className="cursor-default text-gray-500 hover:text-gray-600">
            <Spinner aria-hidden="true" className="w-4 h-4" />
          </button>
        ) : (
          <button
            {...buttonProps}
            ref={clearButtonRef}
            style={{
              visibility: state.inputValue !== "" ? "visible" : "hidden",
            }}
            className="cursor-default text-gray-500 hover:text-gray-600"
          >
            <XIcon aria-hidden="true" className="w-4 h-4" />
          </button>
        )}
      </div>
      {state.isOpen && (
        <Popover
          popoverRef={popoverRef}
          hasItems={state.collection.size > 0}
          isOpen={state.isOpen}
          onClose={state.close}
        >
          <ListBox {...listBoxProps} listBoxRef={listBoxRef} state={state} />
        </Popover>
      )}
    </div>
  );
}
