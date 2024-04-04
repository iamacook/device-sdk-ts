import { useCallback, useEffect, useState } from "react";

type ApduFormValues = {
  classInstruction: string;
  instructionMethod: string;
  firstParameter: string;
  secondParameter: string;
  data: string;
  dataLength: string;
};

export function useApduForm() {
  const [values, setValues] = useState<ApduFormValues>({
    classInstruction: "e0",
    instructionMethod: "01",
    firstParameter: "00",
    secondParameter: "00",
    dataLength: "00",
    data: "",
  });
  const [apdu, setApdu] = useState<Uint8Array>(Uint8Array.from([]));

  const setValue = useCallback((field: keyof ApduFormValues, value: string) => {
    const newValues = { [field]: value };
    if (field === "data") {
      newValues.dataLength = value.length.toString(16);
    }
    setValues((prev) => ({ ...prev, ...newValues }));
  }, []);

  useEffect(() => {
    const newApdu = Object.values(values).reduce(
      (acc, curr) => [
        ...acc,
        ...chunkString(curr.replace(/\s/g, ""))
          .map((char) => Number(`0x${char}`))
          .filter((nbr) => !Number.isNaN(nbr)),
      ],
      [] as number[],
    );
    setApdu(Uint8Array.from(newApdu));
  }, [values]);

  return {
    apduFormValues: values,
    setApduFormValue: setValue,
    apdu,
  };
}

const BYTE_SIZE = 2;

const chunkString = (str: string, size = BYTE_SIZE): string[] => {
  const numChunks = Math.ceil(str.length / size);
  const chunks = new Array<string>(numChunks);

  for (let i = 0, offset = 0; i < numChunks; ++i, offset += size) {
    chunks[i] = str.slice(offset, offset + size);
  }

  return chunks;
};
