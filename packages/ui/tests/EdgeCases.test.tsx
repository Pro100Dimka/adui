import { afterEach, describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { useForm } from "../src/components/forms/Form/Form";
import { Form } from "../src/components/forms/Form/Form";
import { FormFields } from "../src/components/forms/FormFields/FormFields";
import { AudioPlayer } from "../src/components/media/AudioPlayer/AudioPlayer";
import { useWaveformPeaks } from "../src/components/media/Waveform/useWaveformPeaks";
import { DatePicker } from "../src/components/controls/DatePicker/DatePicker";
import { Autocomplete } from "../src/components/controls/Autocomplete/Autocomplete";
import { FilePicker } from "../src/components/controls/FilePicker/FilePicker";
import { TagInput } from "../src/components/controls/TagInput/TagInput";
import { PeoplePicker } from "../src/components/controls/PeoplePicker/PeoplePicker";
import { DataTable } from "../src/components/feedback/DataTable/DataTable";
import { matchRoute } from "../src/components/navigation/Router/Router";
import { useSiteSettings, siteThemeProps } from "../../../apps/playground/src/app/siteSettings";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("forms under overlapping work", () => {
  it("does not rerender merely to reinitialize unchanged mount values", () => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    let renders = 0;
    function Probe() {
      renders++;
      useForm({ initialValues: { name: "same" } });
      return null;
    }
    let tree!: ReactTestRenderer;
    act(() => { tree = create(<Probe />); });
    expect(renders).toBe(1);
    act(() => tree.unmount());
  });

  it("ignores setting a field to its existing value", () => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    let form!: ReturnType<typeof useForm<{ name: string }>>;
    let renders = 0;
    function Probe() { renders++; form = useForm({ initialValues: { name: "same" } }); return null; }
    let tree!: ReactTestRenderer;
    act(() => { tree = create(<Probe />); });
    const before = renders;
    act(() => form.setValue("name", "same"));
    expect(renders).toBe(before);
    act(() => tree.unmount());
  });

  it("does not rerender when an already touched field is blurred again", async () => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    let form!: ReturnType<typeof useForm<{ name: string }>>;
    let renders = 0;
    function Probe() {
      renders++;
      form = useForm({ initialValues: { name: "same" }, validateOnBlur: false });
      return null;
    }
    let tree!: ReactTestRenderer;
    act(() => { tree = create(<Probe />); });
    act(() => form.setTouched("name"));
    const before = renders;
    act(() => form.setTouched("name"));
    expect(renders).toBe(before);
    act(() => tree.unmount());
  });

  it("does not serialize stable initial values again for an unrelated form-state change", () => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    let reads = 0;
    const initialValues = { name: "same", get payload() { reads++; return "large initial payload"; } };
    let form!: ReturnType<typeof useForm<typeof initialValues>>;
    function Probe() {
      form = useForm({ initialValues, validateOnBlur: false });
      return null;
    }
    let tree!: ReactTestRenderer;
    act(() => { tree = create(<Probe />); });
    const before = reads;
    act(() => form.setTouched("name"));
    expect(reads).toBe(before);
    act(() => tree.unmount());
  });

  it("updates one nested field without cloning unrelated values", () => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    const profile = { city: "Kyiv" };
    let form!: ReturnType<typeof useForm<{ name: string; profile: typeof profile }>>;
    function Probe() { form = useForm({ initialValues: { name: "Old", profile } }); return null; }
    let tree!: ReactTestRenderer;
    act(() => { tree = create(<Probe />); });
    act(() => form.setValue("name", "New"));
    expect(form.values.profile).toBe(profile);
    act(() => tree.unmount());
  });

  it("does not rerender an unchanged sibling field", () => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    let form!: ReturnType<typeof useForm<{ first: string; second: string }>>;
    let secondRenders = 0;
    const fields = [{ name: "first", kind: "text" as const }, { name: "second", kind: "text" as const }];
    const registry = { text: ({ value }: { value: unknown }) => {
      if (value === "second") secondRenders++;
      return <span>{String(value)}</span>;
    } };
    function Probe() {
      form = useForm({ initialValues: { first: "first", second: "second" } });
      return <Form form={form}><FormFields fields={fields} registry={registry} /></Form>;
    }
    let tree!: ReactTestRenderer;
    act(() => { tree = create(<Probe />); });
    const initial = secondRenders;
    act(() => form.setValue("first", "changed"));
    expect(secondRenders).toBe(initial);
    act(() => tree.unmount());
  });

  it("ignores a stale asynchronous validation result", async () => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    const pending: Array<{ value: string; resolve: (errors: Record<string, string>) => void }> = [];
    let form!: ReturnType<typeof useForm<{ name: string }>>;
    function Probe() {
      form = useForm({
        initialValues: { name: "" },
        validateOnChange: true,
        validate: (values) => new Promise((resolve) => pending.push({ value: values.name, resolve })),
      });
      return null;
    }
    let tree!: ReactTestRenderer;
    await act(async () => { tree = create(<Probe />); });
    await act(async () => { form.setValue("name", "bad"); form.setValue("name", "good"); });
    expect(pending.map(({ value }) => value)).toEqual(["bad", "good"]);
    await act(async () => { pending[1].resolve({}); });
    await act(async () => { pending[0].resolve({ name: "Old error" }); });
    expect(form.values.name).toBe("good");
    expect(form.errors).toEqual({});
    act(() => tree.unmount());
  });

  it("does not run concurrent submissions twice", async () => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    const releases: Array<() => void> = [];
    const onSubmit = vi.fn(() => new Promise<void>((resolve) => releases.push(resolve)));
    let form!: ReturnType<typeof useForm<{ name: string }>>;
    function Probe() {
      form = useForm({ initialValues: { name: "x" }, onSubmit });
      return null;
    }
    let tree!: ReactTestRenderer;
    await act(async () => { tree = create(<Probe />); });
    let first!: Promise<boolean>;
    let second!: Promise<boolean>;
    await act(async () => { first = form.submit(); second = form.submit(); await Promise.resolve(); });
    expect(onSubmit).toHaveBeenCalledTimes(1);
    await act(async () => { releases.forEach((release) => release()); await Promise.all([first, second]); });
    act(() => tree.unmount());
  });
});

describe("input edge cases", () => {
  it("does not normalize impossible calendar dates", () => {
    const markup = renderToStaticMarkup(<DatePicker value="2024-02-31" label="Date" />);
    expect(markup).not.toContain('value="02.03.2024"');
  });

  it("rejects an impossible month typed into the calendar field", () => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    const onValueChange = vi.fn();
    let tree!: ReactTestRenderer;
    act(() => { tree = create(<DatePicker value="" onValueChange={onValueChange} />); });
    const input = tree.root.findByType("input");
    act(() => input.props.onChange({ currentTarget: { value: "01.13.2024" } }));
    act(() => input.props.onBlur());
    expect(onValueChange).not.toHaveBeenCalled();
    act(() => tree.unmount());
  });

  it("does not let a disabled autocomplete change its value through an adornment", () => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    const onValueChange = vi.fn();
    let tree!: ReactTestRenderer;
    act(() => { tree = create(<Autocomplete disabled clearable value="ASIO" onValueChange={onValueChange} />); });
    const buttons = tree.root.findAll((node) => node.type === "button");
    expect(buttons.every((button) => button.props.disabled)).toBe(true);
    act(() => tree.unmount());
  });

  it("rejects a dropped file outside the accepted types and ignores a disabled drop", () => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    const onFiles = vi.fn();
    let tree!: ReactTestRenderer;
    const file = { name: "notes.txt", type: "text/plain" } as File;
    act(() => { tree = create(<FilePicker variant="zone" accept="image/*" onFiles={onFiles} />); });
    const zone = () => tree.root.findAll((node) => node.type === "button" && node.props["data-variant"] === "zone")[0];
    act(() => zone().props.onDrop({ preventDefault() {}, dataTransfer: { files: [file] } }));
    expect(onFiles).not.toHaveBeenCalled();
    act(() => { tree.update(<FilePicker variant="zone" accept="image/*" disabled onFiles={onFiles} />); });
    act(() => zone().props.onDrop({ preventDefault() {}, dataTransfer: { files: [file] } }));
    expect(onFiles).not.toHaveBeenCalled();
    act(() => tree.unmount());
  });

  it("never accepts non-image files for an avatar even with a broad accept prop", () => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    const onFiles = vi.fn();
    let tree!: ReactTestRenderer;
    act(() => { tree = create(<FilePicker variant="avatar" accept="audio/*" onFiles={onFiles} />); });
    const button = tree.root.findAll((node) => node.type === "button" && node.props.className === "ad-file-picker-avatar-button")[0];
    const audio = new Blob(["sound"], { type: "audio/mpeg" }) as File;
    Object.defineProperty(audio, "name", { value: "sound.mp3" });
    act(() => button.props.onDrop({ preventDefault() {}, dataTransfer: { files: [audio] } }));
    expect(onFiles).not.toHaveBeenCalled();
    act(() => tree.unmount());
  });

  it("deduplicates case-insensitive tags within one pasted batch", () => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    const onValueChange = vi.fn();
    let tree!: ReactTestRenderer;
    act(() => { tree = create(<TagInput onValueChange={onValueChange} />); });
    act(() => tree.root.findByType("input").props.onChange({ currentTarget: { value: "Alpha,alpha" } }));
    expect(onValueChange).toHaveBeenLastCalledWith(["Alpha"]);
    act(() => tree.unmount());
  });

  it("shows a failed remote people search without an unhandled rejection", async () => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    vi.useFakeTimers();
    let tree!: ReactTestRenderer;
    await act(async () => { tree = create(<PeoplePicker onSearch={() => Promise.reject(new Error("offline"))} />); });
    await act(async () => { tree.root.findByType("input").props.onChange({ currentTarget: { value: "Anna" } }); });
    await act(async () => { await vi.advanceTimersByTimeAsync(230); });
    expect(tree.root.findAllByType("div").some((node) => node.children.includes("offline"))).toBe(true);
    act(() => tree.unmount());
  });
});

describe("audio playback follows the real media", () => {
  it("moves playing state and volume to a replacement source", async () => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    vi.stubGlobal("document", { hidden: true });
    const media: Array<{ src: string; volume: number; plays: number; pauses: number }> = [];
    vi.stubGlobal("Audio", class extends EventTarget {
      src: string;
      volume = 1;
      muted = false;
      currentTime = 0;
      plays = 0;
      pauses = 0;
      constructor(src: string) { super(); this.src = src; media.push(this); }
      play() { this.plays++; return Promise.resolve(); }
      pause() { this.pauses++; }
    });
    let tree!: ReactTestRenderer;
    await act(async () => { tree = create(<AudioPlayer src="first.mp3" volume={0.2} />); });
    await act(async () => { tree.root.findAll((node) => node.props["aria-label"] === "Воспроизвести")[0].props.onClick(); });
    await act(async () => { tree.update(<AudioPlayer src="second.mp3" volume={0.2} />); });
    expect(media[0]).toMatchObject({ plays: 1, pauses: 1 });
    expect(media[1]).toMatchObject({ plays: 1, volume: 0.2 });
    act(() => tree.unmount());
  });

  it("does not claim to be playing when the browser refuses playback", async () => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    vi.stubGlobal("document", { hidden: true });
    vi.stubGlobal("Audio", class extends EventTarget {
      volume = 1;
      muted = false;
      currentTime = 0;
      play() { return Promise.reject(new Error("blocked")); }
      pause() {}
    });
    let tree!: ReactTestRenderer;
    await act(async () => { tree = create(<AudioPlayer src="blocked.mp3" />); });
    await act(async () => {
      tree.root.findAll((node) => node.props["aria-label"] === "Воспроизвести")[0].props.onClick();
      await Promise.resolve();
    });
    expect(tree.root.findAll((node) => node.props["data-playing"] === true)).toHaveLength(0);
    act(() => tree.unmount());
  });
});

describe("waveform decoding remains cooperative", () => {
  it("yields while measuring a long recording instead of blocking every input task", async () => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    vi.useFakeTimers();
    const length = 300_000;
    let reads = 0;
    const channel = new Proxy(new Float32Array(length).fill(0.5), {
      get(samples, key) {
        if (typeof key === "string" && /^\d+$/.test(key)) reads++;
        return Reflect.get(samples, key);
      },
    });
    vi.stubGlobal("performance", { now: () => reads / 1000 });
    vi.stubGlobal("OfflineAudioContext", class {
      async decodeAudioData() {
        return { length, numberOfChannels: 1, getChannelData: () => channel };
      }
    });
    const source = new Blob(["audio"]);
    let data!: ReturnType<typeof useWaveformPeaks>;
    function Probe() { data = useWaveformPeaks(source); return null; }
    let tree!: ReactTestRenderer;
    await act(async () => { tree = create(<Probe />); });
    expect(reads).toBeGreaterThan(0);
    expect(reads).toBeLessThan(length);
    expect(data).toBeNull();
    await act(async () => { await vi.runAllTimersAsync(); });
    expect(data?.peaks).toHaveLength(600);
    expect(reads).toBe(length);
    act(() => tree.unmount());
  });

  it("aborts the previous waveform request when its source changes or unmounts", async () => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    const signals: AbortSignal[] = [];
    vi.stubGlobal("fetch", vi.fn((_src, options) => {
      signals.push(options?.signal);
      return new Promise(() => {});
    }));
    function Probe({ src }: { src: string }) { useWaveformPeaks(src); return null; }
    let tree!: ReactTestRenderer;
    await act(async () => { tree = create(<Probe src="first.mp3" />); });
    expect(signals[0]).toBeInstanceOf(AbortSignal);
    await act(async () => { tree.update(<Probe src="second.mp3" />); });
    expect(signals[0].aborted).toBe(true);
    expect(signals[1].aborted).toBe(false);
    act(() => tree.unmount());
    expect(signals[1].aborted).toBe(true);
  });

  it("includes the end of a recording when its sample count is not divisible by bins", async () => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    const channel = new Float32Array(10);
    channel[9] = 1;
    vi.stubGlobal("OfflineAudioContext", class {
      async decodeAudioData() {
        return { length: channel.length, numberOfChannels: 1, getChannelData: () => channel };
      }
    });
    const source = new Blob(["audio"]);
    let data!: ReturnType<typeof useWaveformPeaks>;
    function Probe() { data = useWaveformPeaks(source, 3); return null; }
    let tree!: ReactTestRenderer;
    await act(async () => { tree = create(<Probe />); });
    expect(data?.peaks).toEqual([0, 0, 1]);
    expect(data?.rms[2]).toBe(0.5);
    act(() => tree.unmount());
  });

  it("normalizes an invalid bin count before measuring the recording", async () => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    const channel = new Float32Array(600).fill(1);
    vi.stubGlobal("OfflineAudioContext", class {
      async decodeAudioData() {
        return { length: channel.length, numberOfChannels: 1, getChannelData: () => channel };
      }
    });
    const source = new Blob(["audio"]);
    let data!: ReturnType<typeof useWaveformPeaks>;
    function Probe() { data = useWaveformPeaks(source, NaN); return null; }
    let tree!: ReactTestRenderer;
    await act(async () => { tree = create(<Probe />); });
    expect(data?.peaks).toHaveLength(600);
    act(() => tree.unmount());
  });
});

describe("routing, persistence and row identity", () => {
  it("treats malformed percent escapes as a non-match instead of throwing", () => {
    expect(matchRoute([{ path: "/user/:id" }], "/user/%")).toBeNull();
  });

  it("recovers from a saved theme with an unknown name", () => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    vi.stubGlobal("localStorage", {
      getItem: () => JSON.stringify({ themeConfig: { version: 1, mode: "simple", theme: "missing" } }),
      setItem: () => {},
    });
    vi.stubGlobal("document", { documentElement: { style: {} } });
    function Probe() {
      const [settings] = useSiteSettings();
      return <span>{siteThemeProps(settings).theme}</span>;
    }
    let tree!: ReactTestRenderer;
    act(() => { tree = create(<Probe />); });
    expect(tree.root.findByType("span").props.children).toBe("ruby");
    act(() => tree.unmount());
  });

  it("keeps selection attached to a row when the parent reorders rows", () => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    const alice = { id: "alice", name: "Alice" };
    const bob = { id: "bob", name: "Bob" };
    const make = (rows: typeof alice[]) => <DataTable columns={[{ key: "name", title: "Name" }]} rows={rows} selectable defaultSelected={["alice"]} />;
    let tree!: ReactTestRenderer;
    act(() => { tree = create(make([alice, bob])); });
    const selected = () => tree.root.findAll((node) => node.type === "tr" && node.props["data-selected"] === true)[0]
      .findAll((node) => node.type === "td" && !node.props.className).map((node) => node.children.join(""));
    expect(selected()).toEqual(["Alice"]);
    act(() => { tree.update(make([bob, alice])); });
    expect(selected()).toEqual(["Alice"]);
    act(() => tree.unmount());
  });

  it("keeps id-less row identity and does not collide with an explicit id", () => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    const alice = { name: "Alice" };
    const bob = { id: "1", name: "Bob" };
    const make = (rows: Array<typeof alice | typeof bob>) =>
      <DataTable columns={[{ key: "name", title: "Name" }]} rows={rows} selectable />;
    let tree!: ReactTestRenderer;
    act(() => { tree = create(make([alice, bob])); });
    const selected = () => tree.root.findAll((node) => node.type === "tr" && node.props["data-selected"] === true)
      .flatMap((row) => row.findAll((node) => node.type === "td" && !node.props.className).map((cell) => cell.children.join("")));
    const first = tree.root.findAll((node) => node.type === "tr" && node.props["data-clickable"] === undefined && node.findAll((child) => child.type === "td").length > 0)[0];
    act(() => first.findByType("input").props.onChange({ currentTarget: { checked: true } }));
    expect(selected()).toEqual(["Alice"]);
    act(() => { tree.update(make([bob, alice])); });
    expect(selected()).toEqual(["Alice"]);
    act(() => tree.unmount());
  });

  it("groups rows without rescanning every row once per group", () => {
    const value = vi.fn((row: { id: string; group: string }) => row.group);
    const rows = Array.from({ length: 100 }, (_, index) => ({ id: String(index), group: `Group ${index % 10}` }));
    renderToStaticMarkup(<DataTable columns={[{ key: "group", title: "Group", value }]} rows={rows} groupBy="group" />);
    expect(value.mock.calls.length).toBeLessThan(300);
  });
});
