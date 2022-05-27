import type { SliderState } from "@react-stately/slider";
import type { AriaSliderProps } from "@react-types/slider";
import { VisuallyHidden } from "@react-aria/visually-hidden";
import { mergeProps } from "@react-aria/utils";
import { useDebouncedCallback } from "use-debounce";
import { useFocusRing } from "@react-aria/focus";
import { useNumberFormatter } from "@react-aria/i18n";
import { useSlider, useSliderThumb } from "@react-aria/slider";
import { useSliderState } from "@react-stately/slider";
import React from "react";
import clsx from "clsx";

type InputProps = {
  index: number;
  maxValue: number;
  minValue: number;
  onChange: (value: number[]) => void;
  placeholder: string;
  state: SliderState;
};

type RangeSliderProps = Omit<AriaSliderProps, "maxValue"> & {
  formatOptions?: Intl.NumberFormatOptions;
  maxInputValue?: number;
  maxSliderValue: number;
};

type ThumbProps = {
  index: number;
  state: SliderState;
  trackRef: React.RefObject<HTMLDivElement>;
};

const clamp = (min: number, max: number, value: number) =>
  Math.max(min, Math.min(max, value));

function Input({
  index,
  maxValue,
  minValue,
  placeholder,
  state,
  ...props
}: InputProps) {
  const [value, setValue] = React.useState<number | null>(() => {
    console.log("remounting", index);
    return null;
  });

  const onChange = useDebouncedCallback((value: number) => {
    const clamped = clamp(minValue, maxValue, value);

    state.setThumbValue(index, clamped);

    props.onChange(
      state.values.map((val, idx) => (idx === index ? clamped : val))
    );

    if (clamped !== value) {
      setValue(clamped);
    }
  }, 500);

  // When thumb is dragging, reset the value we typed
  React.useEffect(() => {
    if (state.isThumbDragging(index)) {
      setValue(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, state.isThumbDragging]);

  return (
    <div className="relative rounded-md shadow-sm">
      <input
        type="number"
        className="form-input focus:ring-red-500 focus:border-red-500 dark:focus:ring-gray-300 dark:focus:border-gray-300 block w-24 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:disabled:bg-gray-500 dark:placeholder-gray-400 rounded-md disabled:placeholder-gray-300 disabled:text-gray-300 transition-placeholder transition-text ease-linear duration-300 disabled:cursor-not-allowed"
        placeholder={placeholder}
        maxLength={5}
        max={maxValue}
        min={minValue}
        autoComplete="off"
        onWheel={(event) => (event.target as HTMLInputElement).blur()}
        onChange={(event) => {
          const value = Number(event.target.value);

          // Always update value of what we are typing
          setValue(value);

          // Debounced change event to update sliders and url
          onChange(value);
        }}
        value={value ?? state.getThumbValue(index)}
      />
    </div>
  );
}

function Thumb(props: ThumbProps) {
  const { state, trackRef, index } = props;
  const inputRef = React.useRef<HTMLInputElement>(null);
  const { thumbProps, inputProps } = useSliderThumb(
    {
      index,
      trackRef,
      inputRef,
    },
    state
  );
  const { focusProps, isFocusVisible } = useFocusRing();

  return (
    <div
      className="absolute top-1 -translate-x-1/2"
      style={{ left: `${state.getThumbPercent(index) * 100}%` }}
    >
      <div
        {...thumbProps}
        className={clsx(
          "w-5 h-5 rounded-full",
          isFocusVisible
            ? "bg-orange-900"
            : state.isThumbDragging(index)
            ? "bg-slate-700"
            : "bg-slate-600"
        )}
      >
        <VisuallyHidden>
          <input ref={inputRef} {...mergeProps(inputProps, focusProps)} />
        </VisuallyHidden>
      </div>
    </div>
  );
}

export default function RangeSlider(props: RangeSliderProps) {
  const trackRef = React.useRef<HTMLDivElement>(null);

  const numberFormatter = useNumberFormatter(props.formatOptions);
  const state = useSliderState({
    ...props,
    maxValue: props.maxSliderValue,
    numberFormatter,
  });
  const { groupProps, trackProps, labelProps, outputProps } = useSlider(
    props,
    state,
    trackRef
  );
  const onInputChange = React.useCallback(
    (value: number[]) => {
      props.onChange?.(value);
      props.onChangeEnd?.(value);
    },
    [props]
  );

  return (
    <>
      <div
        {...groupProps}
        className="relative flex flex-col items-center w-full px-3 touch-none"
      >
        <div className="flex self-stretch text-sm text-gray-900">
          {props.label ? <label {...labelProps}>{props.label}</label> : null}
          <output
            {...outputProps}
            className="flex-auto flex-shrink-0 text-right"
          >
            {`${state.getThumbValueLabel(0)} - ${state.getThumbValueLabel(1)}`}
          </output>
        </div>
        <div {...trackProps} ref={trackRef} className="relative w-full h-8">
          <div className="absolute bg-slate-400 h-1 top-3 w-full rounded-full" />
          <Thumb index={0} state={state} trackRef={trackRef} />
          <Thumb index={1} state={state} trackRef={trackRef} />
        </div>
      </div>
      <div className="flex items-center gap-3 p-1">
        <Input
          index={0}
          maxValue={state.getThumbValue(1)}
          minValue={0}
          onChange={onInputChange}
          placeholder="Minimum"
          state={state}
        />
        <span> - </span>
        <Input
          index={1}
          maxValue={props.maxInputValue ?? props.maxSliderValue ?? 0}
          minValue={state.getThumbValue(0)}
          onChange={onInputChange}
          placeholder="Maximum"
          state={state}
        />
      </div>
    </>
  );
}
