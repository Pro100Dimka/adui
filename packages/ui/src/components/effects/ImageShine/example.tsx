import { ImageShine } from "@ad-voice/ui";

// Any picture with transparency works; this one is a neon note drawn inline.
const note = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="#7a0b24"/><path d="M42 24v36a10 10 0 1 0 6 9V38l20-6v20a10 10 0 1 0 6 9V18z" fill="#ff4d76"/></svg>',
)}`;

export default function ImageShineExample() {
  return (
    <div style={{ width: "12rem" }}>
      <ImageShine src={note} label="Нота" />
    </div>
  );
}
