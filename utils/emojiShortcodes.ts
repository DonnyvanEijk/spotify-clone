const SHORTCODES: Record<string, string> = {
  // Faces
  joy: "😂", laughing: "😆", smile: "😊", smiley: "😃", grinning: "😀",
  rofl: "🤣", sweat_smile: "😅", heart_eyes: "😍", kissing_heart: "😘",
  wink: "😉", blush: "😊", yum: "😋", sunglasses: "😎", thinking: "🤔",
  raised_eyebrow: "🤨", neutral_face: "😐", expressionless: "😑",
  smirk: "😏", unamused: "😒", roll_eyes: "🙄", grimacing: "😬",
  flushed: "😳", astonished: "😲", open_mouth: "😮", sleeping: "😴",
  dizzy_face: "😵", rage: "😡", angry: "😠", triumph: "😤",
  cry: "😢", sob: "😭", fearful: "😨", cold_sweat: "😰", weary: "😩",
  tired_face: "😫", yawning_face: "🥱", zany_face: "🤪", woozy_face: "🥴",
  pleading_face: "🥺", partying_face: "🥳", star_struck: "🤩",
  hot_face: "🥵", cold_face: "🥶", skull: "💀", ghost: "👻",
  alien: "👽", robot: "🤖", poop: "💩", clown_face: "🤡",
  // Hands
  thumbsup: "👍", "+1": "👍", thumbsdown: "👎", "-1": "👎",
  clap: "👏", wave: "👋", raised_hands: "🙌", pray: "🙏",
  point_right: "👉", point_left: "👈", point_up: "☝️", point_down: "👇",
  ok_hand: "👌", v: "✌️", crossed_fingers: "🤞", metal: "🤘",
  call_me_hand: "🤙", muscle: "💪", handshake: "🤝", facepalm: "🤦",
  shrug: "🤷",
  // Hearts
  heart: "❤️", hearts: "💕", two_hearts: "💕", heartpulse: "💗",
  sparkling_heart: "💖", blue_heart: "💙", green_heart: "💚",
  yellow_heart: "💛", orange_heart: "🧡", purple_heart: "💜",
  black_heart: "🖤", broken_heart: "💔", cupid: "💘",
  // Common
  fire: "🔥", tada: "🎉", sparkles: "✨", star: "⭐", star2: "🌟",
  zap: "⚡", boom: "💥", eyes: "👀", "100": "💯",
  zzz: "💤", speech_balloon: "💬", loudspeaker: "📢", bell: "🔔",
  musical_note: "🎵", notes: "🎶", microphone: "🎤",
  trophy: "🏆", checkered_flag: "🏁", medal: "🎖️",
  pizza: "🍕", hamburger: "🍔", taco: "🌮", coffee: "☕",
  beer: "🍺", wine_glass: "🍷", champagne: "🍾",
  rainbow: "🌈", sun: "☀️", moon: "🌙", cloud: "☁️", snowflake: "❄️",
  rocket: "🚀", airplane: "✈️", car: "🚗",
  dog: "🐶", cat: "🐱", fox: "🦊", bear: "🐻", panda: "🐼",
  lion: "🦁", unicorn: "🦄", butterfly: "🦋",
  gem: "💎", key: "🔑", lock: "🔒", hammer: "🔨",
  computer: "💻", phone: "📱", camera: "📷", headphones: "🎧",
  bulb: "💡", mag: "🔍", books: "📚", pencil: "✏️",
  no_entry: "⛔", warning: "⚠️", x: "❌", white_check_mark: "✅",
  heavy_check_mark: "✔️", exclamation: "❗", question: "❓",
  recycle: "♻️", sos: "🆘",
};

export function processShortcodes(text: string): string {
  return text.replace(/:([a-z0-9_+\-]+):/g, (match, code) => SHORTCODES[code] ?? match);
}

// Characters that make up emoji: pictographs, regional indicators (flags),
// skin-tone modifiers, ZWJ / variation selectors, keycap combiner.
const EMOJI_CHARS = /[\p{Extended_Pictographic}\u{1F1E6}-\u{1F1FF}\u{1F3FB}-\u{1F3FF}‍️⃣]/gu;

/**
 * If `text` is made up of only emoji (plus whitespace), returns how many
 * emoji it contains. Returns 0 for anything else. Used to render short
 * emoji-only messages larger ("jumbomoji").
 */
export function emojiOnlyCount(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  // Anything left after removing emoji + whitespace means it's not emoji-only.
  if (trimmed.replace(EMOJI_CHARS, "").replace(/\s/g, "") !== "") return 0;

  const noSpace = trimmed.replace(/\s/g, "");
  // Count grapheme clusters so ZWJ sequences (👨‍👩‍👧) count as one.
  if (typeof Intl !== "undefined" && (Intl as any).Segmenter) {
    const seg = new (Intl as any).Segmenter(undefined, { granularity: "grapheme" });
    return [...seg.segment(noSpace)].length;
  }
  return Array.from(noSpace).length;
}
