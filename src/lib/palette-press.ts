import type { Address } from "viem";

export const MAX_PALETTE_TITLE_LENGTH = 24;
export const MAX_PALETTE_NOTE_LENGTH = 160;

export const palettePressAbi = [
  {
    type: "function",
    name: "publishPalette",
    stateMutability: "nonpayable",
    inputs: [
      { name: "title", type: "string" },
      { name: "note", type: "string" },
      { name: "colorA", type: "string" },
      { name: "colorB", type: "string" },
      { name: "colorC", type: "string" },
    ],
    outputs: [{ name: "paletteId", type: "uint256" }],
  },
  {
    type: "function",
    name: "getPalette",
    stateMutability: "view",
    inputs: [{ name: "paletteId", type: "uint256" }],
    outputs: [
      { name: "author", type: "address" },
      { name: "title", type: "string" },
      { name: "note", type: "string" },
      { name: "colorA", type: "string" },
      { name: "colorB", type: "string" },
      { name: "colorC", type: "string" },
      { name: "createdAt", type: "uint256" },
    ],
  },
  {
    type: "function",
    name: "nextPaletteId",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

export type PalettePressData = {
  author: Address;
  title: string;
  note: string;
  colorA: string;
  colorB: string;
  colorC: string;
  createdAt: bigint;
};

export const palettePressContractAddress = process.env
  .NEXT_PUBLIC_PALETTE_PRESS_CONTRACT_ADDRESS as Address | undefined;
