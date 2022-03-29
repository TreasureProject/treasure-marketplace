import { Dispatch, SetStateAction } from "react";

interface BinaryOptionProps {
  options: [string, string];
  checked: boolean;
  onChange: Dispatch<SetStateAction<boolean>>;
}

interface OptionProps {
  label: string;
  checked?: boolean;
  onClick: () => void;
}

const Option = ({ label, checked, onClick }: OptionProps) => (
  <span
    className={`text-center leading-loose border border-white opacity-80 cursor-pointer select-none w-32 md:w-32 lg:w-32 ${
      checked ? "bg-red-500" : "bg-transparent"
    }`}
    onClick={onClick}
  >
    {label}
  </span>
);

const BinaryOption = ({ options, checked, onChange }: BinaryOptionProps) => {
  const handler = () => onChange(!checked);

  return (
    <div className="flex align-center justify-center border border-white rounded-md overflow-hidden w-32 shrink-0 flex-wrap md:w-64 md:flex-nowrap">
      <Option checked={!checked} label={options[0]} onClick={handler} />
      <Option checked={checked} label={options[1]} onClick={handler} />
    </div>
  );
};

export default BinaryOption;
