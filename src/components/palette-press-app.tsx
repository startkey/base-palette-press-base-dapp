"use client";

import {
  BadgePlus,
  Loader2,
  Palette,
  ScanSearch,
  SquareStack,
  Wallet,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { Address } from "viem";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useReadContract,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { base } from "wagmi/chains";
import {
  MAX_PALETTE_NOTE_LENGTH,
  MAX_PALETTE_TITLE_LENGTH,
  palettePressAbi,
  palettePressContractAddress,
} from "@/lib/palette-press";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const PRESET_PALETTES = [
  ["#0B0B0B", "#F4EFDB", "#F54D36"],
  ["#115DFF", "#F8D73D", "#FFFFFF"],
  ["#1E8A5C", "#F6C06A", "#2B2039"],
  ["#6E47FF", "#FF8CC6", "#FFF6E8"],
] as const;

function shortAddress(address?: Address) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatDate(createdAt?: bigint) {
  if (!createdAt) return "--";
  return new Date(Number(createdAt) * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function PalettePoster({
  title,
  colors,
  note,
}: {
  title: string;
  colors: [string, string, string];
  note: string;
}) {
  return (
    <div className="grid min-h-[420px] grid-rows-[1fr_1fr_1fr_auto] border-[3px] border-black bg-white">
      {colors.map((color, index) => (
        <div
          key={`${color}-${index}`}
          className="flex items-end justify-between border-b-[3px] border-black px-5 py-4 last:border-b-0"
          style={{ backgroundColor: color }}
        >
          <span className="text-xs font-black uppercase tracking-[0.2em] text-black/70">
            {index === 0 ? "Tone A" : index === 1 ? "Tone B" : "Tone C"}
          </span>
          <span className="text-lg font-black text-black">{color}</span>
        </div>
      ))}
      <div className="border-t-[3px] border-black bg-[#F7F0E8] p-5">
        <p className="text-[11px] font-black uppercase tracking-[0.22em] text-black/60">
          Palette note
        </p>
        <h3 className="mt-2 text-3xl font-black uppercase leading-none text-black">
          {title}
        </h3>
        <p className="mt-3 text-sm leading-6 text-black/70">{note}</p>
      </div>
    </div>
  );
}

export function PalettePressApp() {
  const [paletteIdInput, setPaletteIdInput] = useState("1");
  const [title, setTitle] = useState("Late Print");
  const [note, setNote] = useState(
    "A sharp headline palette for days that need strong contrast and no visual hesitation.",
  );
  const [colorA, setColorA] = useState("#0B0B0B");
  const [colorB, setColorB] = useState("#F4EFDB");
  const [colorC, setColorC] = useState("#F54D36");
  const [status, setStatus] = useState(
    "Build a 3-color poster palette and publish it on Base.",
  );
  const [walletStatus, setWalletStatus] = useState("");

  const { address, chainId, connector, isConnected } = useAccount();
  const { connectors, connectAsync, isPending: connecting } = useConnect();
  const { disconnectAsync, isPending: disconnecting } = useDisconnect();
  const { switchChain, isPending: switching } = useSwitchChain();
  const {
    data: hash,
    writeContract,
    isPending: writing,
    error: writeError,
  } = useWriteContract();

  const { isLoading: confirming, isSuccess: confirmed } =
    useWaitForTransactionReceipt({ hash });

  const availableConnectors = useMemo(
    () =>
      connectors
        .filter((item) => item.type !== "mock")
        .sort((a, b) => {
          const score = (item: (typeof connectors)[number]) => {
            if (item.id === "baseAccount" || item.name === "Base Account") {
              return 0;
            }
            if (item.type === "injected") return 1;
            return 2;
          };

          return score(a) - score(b);
        }),
    [connectors],
  );

  async function connectWallet() {
    const errors: string[] = [];
    setWalletStatus("Opening wallet...");

    for (const item of availableConnectors) {
      try {
        await connectAsync({ connector: item, chainId: base.id });
        setWalletStatus("");
        return;
      } catch (error) {
        errors.push(
          error instanceof Error
            ? `${item.name}: ${error.message}`
            : `${item.name}: connection failed`,
        );
      }
    }

    setWalletStatus(
      errors[0] ??
        "No wallet connector is available. Open this app inside Base App or install a wallet.",
    );
  }

  async function disconnectWallet() {
    try {
      if (connector) {
        await disconnectAsync({ connector });
      } else {
        await disconnectAsync();
      }
      setWalletStatus("Wallet disconnected. Tap Connect to reconnect.");
    } catch (error) {
      setWalletStatus(
        error instanceof Error ? error.message : "Could not disconnect wallet.",
      );
    }
  }
  const parsedPaletteId = BigInt(Math.max(1, Number(paletteIdInput || "1")));

  const paletteQuery = useReadContract({
    abi: palettePressAbi,
    address: palettePressContractAddress,
    functionName: "getPalette",
    args: [parsedPaletteId],
    query: {
      enabled: Boolean(palettePressContractAddress),
      refetchInterval: 12000,
    },
  });

  const totalQuery = useReadContract({
    abi: palettePressAbi,
    address: palettePressContractAddress,
    functionName: "nextPaletteId",
    query: {
      enabled: Boolean(palettePressContractAddress),
      refetchInterval: 12000,
    },
  });

  const paletteTuple = paletteQuery.data as
    | readonly [Address, string, string, string, string, string, bigint]
    | undefined;

  const palette = useMemo(
    () =>
      paletteTuple
        ? {
            author: paletteTuple[0],
            title: paletteTuple[1],
            note: paletteTuple[2],
            colorA: paletteTuple[3],
            colorB: paletteTuple[4],
            colorC: paletteTuple[5],
            createdAt: paletteTuple[6],
          }
        : undefined,
    [paletteTuple],
  );

  const totalPalettes = totalQuery.data ? Math.max(Number(totalQuery.data) - 1, 0) : 0;
  const activeColors: [string, string, string] = [
    palette?.colorA ?? colorA,
    palette?.colorB ?? colorB,
    palette?.colorC ?? colorC,
  ];

  const canPublish =
    Boolean(palettePressContractAddress) &&
    isConnected &&
    chainId === base.id &&
    title.trim().length > 0 &&
    title.trim().length <= MAX_PALETTE_TITLE_LENGTH &&
    note.trim().length > 0 &&
    note.trim().length <= MAX_PALETTE_NOTE_LENGTH;

  const statusText = confirmed
    ? "Palette poster confirmed on Base."
    : writeError
      ? writeError.message
      : status;

  function applyPreset(colors: readonly [string, string, string], index: number) {
    setColorA(colors[0]);
    setColorB(colors[1]);
    setColorC(colors[2]);
    setTitle(index === 0 ? "Late Print" : index === 1 ? "Signal Cover" : index === 2 ? "Field Notes" : "Neon Essay");
  }

  function publishPalette() {
    if (!palettePressContractAddress) return;
    setStatus("Confirm the palette poster in your wallet.");
    writeContract({
      address: palettePressContractAddress,
      abi: palettePressAbi,
      functionName: "publishPalette",
      args: [title.trim(), note.trim(), colorA, colorB, colorC],
      chainId: base.id,
    });
  }
  const colorFields: Array<{
    key: "A" | "B" | "C";
    value: string;
    setValue: (value: string) => void;
  }> = [
    { key: "A", value: colorA, setValue: setColorA },
    { key: "B", value: colorB, setValue: setColorB },
    { key: "C", value: colorC, setValue: setColorC },
  ];

  return (
    <main className="min-h-screen bg-[#F3EFEB] text-black">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-3 py-3 sm:px-5 lg:px-8">
        <header className="border-[3px] border-black bg-[#FFD54A] px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.28em] text-black/70">
                Base Palette Press
              </p>
              <h1 className="mt-2 max-w-4xl text-4xl font-black uppercase leading-none sm:text-6xl">
                Publish bold 3-color posters onchain.
              </h1>
            </div>

            {isConnected ? (
              <div className="flex items-center gap-2 self-start lg:self-end">
                <span className="border-[3px] border-black bg-white px-3 py-2 text-sm font-black">
                  {shortAddress(address)}
                </span>
                <button
                  className="border-[3px] border-black bg-black px-4 py-2 text-sm font-black uppercase text-white"
                  onClick={disconnectWallet}
                >{disconnecting ? "Disconnecting" : "Disconnect"}</button>
              </div>
            ) : (
              <button
                className="inline-flex items-center gap-2 self-start border-[3px] border-black bg-black px-4 py-2 text-sm font-black uppercase text-white disabled:opacity-60"
                disabled={availableConnectors.length === 0 || connecting}
                onClick={connectWallet}
              >
                {connecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
                Connect
              </button>
            )}
          {walletStatus ? (
            <p className="w-full text-right text-xs font-semibold opacity-75">
              {walletStatus}
            </p>
          ) : null}
        </div>
        </header>

        <div className="grid flex-1 gap-3 pt-3 xl:grid-cols-[430px_minmax(0,1fr)]">
          <aside className="grid gap-3">
            <section className="border-[3px] border-black bg-white p-5">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center border-[3px] border-black bg-[#115DFF] text-white">
                  <BadgePlus className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-3xl font-black uppercase leading-none">New poster</h2>
                  <p className="mt-1 text-sm font-semibold text-black/60">
                    Build a palette card worth saving.
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                <label className="block">
                  <span className="text-[11px] font-black uppercase tracking-[0.22em] text-black/60">
                    Poster title
                  </span>
                  <input
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    maxLength={MAX_PALETTE_TITLE_LENGTH}
                    className="mt-2 w-full border-[3px] border-black bg-[#F7F0E8] px-4 py-3 text-base font-black uppercase outline-none"
                    placeholder="Late Print"
                  />
                </label>

                <div className="grid grid-cols-2 gap-2">
                  {PRESET_PALETTES.map((preset, index) => (
                    <button
                      key={`${preset.join("-")}-${index}`}
                      className="border-[3px] border-black bg-white p-2 text-left"
                      onClick={() => applyPreset(preset, index)}
                    >
                      <div className="grid grid-cols-3 border-[2px] border-black">
                        {preset.map((shade) => (
                          <div key={shade} className="h-10 border-r-[2px] border-black last:border-r-0" style={{ backgroundColor: shade }} />
                        ))}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {colorFields.map(({ key, value, setValue }) => (
                    <label key={key} className="block">
                      <span className="text-[11px] font-black uppercase tracking-[0.22em] text-black/60">
                        Tone {key}
                      </span>
                      <div className="mt-2 border-[3px] border-black bg-white p-2">
                        <input
                          type="color"
                          value={value}
                          onChange={(event) => setValue(event.target.value)}
                          className="h-12 w-full cursor-pointer"
                        />
                      </div>
                    </label>
                  ))}
                </div>

                <label className="block">
                  <span className="text-[11px] font-black uppercase tracking-[0.22em] text-black/60">
                    Caption
                  </span>
                  <textarea
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    maxLength={MAX_PALETTE_NOTE_LENGTH}
                    rows={5}
                    className="mt-2 w-full border-[3px] border-black bg-[#F7F0E8] px-4 py-3 text-base font-semibold leading-7 outline-none"
                    placeholder="Why these tones belong together."
                  />
                </label>

                {!isConnected ? (
                  <button
                    className="w-full border-[3px] border-black bg-black px-4 py-3 text-base font-black uppercase text-white"
                    onClick={connectWallet}
                  >
                    Connect wallet
                  </button>
                ) : chainId !== base.id ? (
                  <button
                    className="w-full border-[3px] border-black bg-[#115DFF] px-4 py-3 text-base font-black uppercase text-white disabled:opacity-60"
                    disabled={switching}
                    onClick={() => switchChain({ chainId: base.id })}
                  >
                    {switching ? "Switching..." : "Switch to Base"}
                  </button>
                ) : (
                  <button
                    className="w-full border-[3px] border-black bg-[#F54D36] px-4 py-3 text-base font-black uppercase text-white disabled:opacity-60"
                    disabled={!canPublish || writing || confirming}
                    onClick={publishPalette}
                  >
                    {writing || confirming ? "Publishing..." : "Publish palette"}
                  </button>
                )}

                <p className="text-sm leading-6 text-black/65">{statusText}</p>
              </div>
            </section>

            <section className="border-[3px] border-black bg-[#115DFF] p-5 text-white">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center border-[3px] border-black bg-white text-black">
                  <ScanSearch className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-3xl font-black uppercase leading-none">Lookup</h2>
                  <p className="mt-1 text-sm font-semibold text-white/75">
                    Pull any poster by ID.
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                <label className="block">
                  <span className="text-[11px] font-black uppercase tracking-[0.22em] text-white/75">
                    Palette ID
                  </span>
                  <input
                    value={paletteIdInput}
                    onChange={(event) => setPaletteIdInput(event.target.value)}
                    inputMode="numeric"
                    className="mt-2 w-full border-[3px] border-black bg-white px-4 py-3 text-base font-black text-black outline-none"
                  />
                </label>

                <div className="border-[3px] border-black bg-white p-4 text-black">
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-black/60">
                    Current poster
                  </p>
                  <p className="mt-2 text-2xl font-black uppercase">
                    {palette?.title || "Waiting for first palette"}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-black/70">
                    {palette?.note || "Once a palette exists, this panel shows the title, caption, colors, and author."}
                  </p>
                </div>
              </div>
            </section>
          </aside>

          <section className="grid gap-3">
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_280px]">
              <section className="border-[3px] border-black bg-white p-5">
                <p className="inline-flex items-center gap-2 border-[3px] border-black bg-[#F7F0E8] px-3 py-1 text-xs font-black uppercase tracking-[0.18em]">
                  <Palette className="h-3.5 w-3.5" />
                  Editorial palette archive
                </p>
                <h2 className="mt-4 max-w-4xl text-4xl font-black uppercase leading-[0.95] sm:text-6xl">
                  Turn three colors into a sharp onchain poster, not just another form submission.
                </h2>
                <p className="mt-4 max-w-3xl text-base font-semibold leading-7 text-black/65 sm:text-lg">
                  Pick a title, define a three-tone system, write one line about the energy, and publish the composition to Base.
                </p>
              </section>

              <div className="grid gap-3">
                <div className="border-[3px] border-black bg-[#F54D36] p-5 text-white">
                  <p className="text-[11px] font-black uppercase tracking-[0.22em] text-white/75">
                    Total posters
                  </p>
                  <p className="mt-2 text-5xl font-black">{totalPalettes || "00"}</p>
                  <p className="mt-2 text-sm font-semibold text-white/80">Palette cards on Base</p>
                </div>
                <div className="border-[3px] border-black bg-[#F8D73D] p-5">
                  <p className="text-[11px] font-black uppercase tracking-[0.22em] text-black/60">
                    Latest author
                  </p>
                  <p className="mt-2 text-xl font-black uppercase">
                    {palette?.author && palette.author !== ZERO_ADDRESS ? shortAddress(palette.author) : "--"}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-black/65">{formatDate(palette?.createdAt)}</p>
                </div>
              </div>
            </div>

            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_320px]">
              <section className="border-[3px] border-black bg-white p-5">
                <PalettePoster
                  title={palette?.title || title}
                  colors={activeColors}
                  note={palette?.note || note}
                />
              </section>

              <div className="grid gap-3">
                <section className="border-[3px] border-black bg-[#115DFF] p-5 text-white">
                  <p className="text-[11px] font-black uppercase tracking-[0.22em] text-white/75">
                    Live palette
                  </p>
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {activeColors.map((shade) => (
                      <div key={shade} className="border-[3px] border-black bg-white p-2 text-black">
                        <div className="h-16 border-[2px] border-black" style={{ backgroundColor: shade }} />
                        <p className="mt-2 text-xs font-black uppercase">{shade}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="border-[3px] border-black bg-[#F7F0E8] p-5">
                  <div className="flex items-center gap-3">
                    <div className="grid h-11 w-11 place-items-center border-[3px] border-black bg-black text-white">
                      <SquareStack className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-black uppercase leading-none">How it works</h3>
                    </div>
                  </div>
                  <div className="mt-5 grid gap-3">
                    {[
                      ["01", "Pick 3 tones", "Build a compact visual system"],
                      ["02", "Name the poster", "Give the palette a memorable label"],
                      ["03", "Publish on Base", "Keep a chain-native archive of your color studies"],
                    ].map(([step, label, sub]) => (
                      <div key={step} className="border-[3px] border-black bg-white p-4">
                        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-black/55">
                          Step {step}
                        </p>
                        <p className="mt-2 text-xl font-black uppercase leading-none">{label}</p>
                        <p className="mt-2 text-sm font-semibold leading-6 text-black/65">{sub}</p>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
