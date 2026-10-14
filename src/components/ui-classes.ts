// ui.md 4.3 버튼, 4.4 입력창 클래스. 여러 컴포넌트가 같이 쓰므로 한곳에 모은다.
const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

export const PRIMARY_BUTTON = `inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60 ${FOCUS}`;
export const SECONDARY_BUTTON = `inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-border bg-surface px-3 text-sm font-medium text-foreground hover:bg-foreground/5 disabled:opacity-60 ${FOCUS}`;
export const DANGER_BUTTON = `inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-danger px-4 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 ${FOCUS}`;
export const TEXT_BUTTON = `rounded text-sm font-medium text-muted hover:text-primary ${FOCUS}`;

const INPUT_BASE =
  "w-full rounded-lg border bg-surface px-3 text-sm placeholder:text-muted focus:outline-none focus:ring-2";
const INPUT_OK = "border-border focus:border-primary focus:ring-primary/20";
const INPUT_ERROR = "border-danger focus:border-danger focus:ring-danger/20";

export function inputClass(invalid: boolean) {
  return `${INPUT_BASE} h-10 ${invalid ? INPUT_ERROR : INPUT_OK}`;
}

export function textareaClass(invalid: boolean) {
  return `${INPUT_BASE} h-auto min-h-20 py-2 ${invalid ? INPUT_ERROR : INPUT_OK}`;
}

export const LABEL = "mb-1.5 block text-sm font-medium";
export const HELP = "mt-1.5 text-xs text-muted";
export const FIELD_ERROR = "mt-1.5 text-xs text-danger";

// ui.md 4.3 스피너
export const SPINNER =
  "size-4 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none";
