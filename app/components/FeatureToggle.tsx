import isString from "lodash/isString";
import isNumber from "lodash/isNumber";
import isNil from "lodash/isNil";
import { useState } from "react";
import type { Scope } from "~/types";
import { Input } from "~/@/components/ui/input";
import { Switch } from "~/@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/@/components/ui/select";

const flagTypes = {
  string: "String",
  boolean: "Boolean",
  number: "Number",
};

type FlagType = keyof typeof flagTypes;
type ValueType = string | boolean | number | undefined;

type FeatureToggleProps = {
  name: string;
  value: ValueType | undefined;
  scopes: Scope[];
};

const getType = (value: ValueType): FlagType => {
  if (isNumber(value)) return "number";
  if (isString(value)) return "string";
  return "boolean";
};

const getValueOrDefault = (value: ValueType | undefined, type: FlagType) => {
  if (isNil(value) || type !== getType(value)) {
    if (type === "number") return 0;
    if (type === "string") return "";
    return false;
  }
  return value;
};

export function FlagNameInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Input
      type="text"
      value={value as string}
      onChange={(e) => onChange(e.target.value)}
      placeholder="value"
    />
  );
}

export function FlagTypeInput({
  type,
  onChange,
}: {
  type: FlagType;
  onChange: (type: FlagType) => void;
}) {
  return (
    <Select value={type} onValueChange={onChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Choose type" />
      </SelectTrigger>
      <SelectContent>
        {Object.keys(flagTypes).map((type) => (
          <SelectItem key={type} value={type}>
            {flagTypes[type as FlagType]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function FlagValueInput({
  value,
  type,
  onChange,
}: {
  value: ValueType;
  type: FlagType;
  onChange: (value: ValueType) => void;
}) {
  if (type === "string") {
    return (
      <Input
        type="text"
        value={value as string}
        onChange={(e) => onChange(e.target.value)}
        placeholder="value"
      />
    );
  }
  if (type === "number") {
    return (
      <Input
        type="number"
        value={value as number}
        onChange={(e) => onChange(e.target.valueAsNumber)}
      />
    );
  }
  if (type === "boolean") {
    return (
      <Switch
        className="my-2"
        checked={value as boolean}
        onCheckedChange={onChange}
      />
    );
  }
}

export function FeatureToggle(props: FeatureToggleProps) {
  const [name, setName] = useState<string>(props.name);
  const [type, setType] = useState<FlagType>(getType(props.value));
  const [value, setValue] = useState<ValueType>(
    getValueOrDefault(props.value, type)
  );

  return (
    <>
      <div className="grid grid-cols-4 gap-4">
        <div className="font-mono font-bold flex items-center">
          <FlagNameInput value={name} onChange={setName} />
        </div>
        <div>
          <FlagTypeInput type={type} onChange={setType} />
        </div>
        <div>
          <FlagValueInput value={value} type={type} onChange={setValue} />
        </div>
      </div>
    </>
  );
}
