import { Equalizer, Marquee, Stack, Typography } from "@ad-voice/ui";

const queue = [
  "Ночь горит огнями — Release Host",
  "Звёзды над городом — Анна",
  "Последний танец — Богдан",
  "Без тебя — Дмитрий",
];

export default function MarqueeExample() {
  return (
    <Marquee duration={18}>
      {queue.map((song) => (
        <Stack key={song} direction="row" gap={2} align="center">
          <Equalizer bars={3} />
          <Typography variant="label">{song}</Typography>
        </Stack>
      ))}
    </Marquee>
  );
}
