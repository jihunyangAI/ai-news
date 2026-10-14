import type { CategoryFormState } from "@/app/categories/actions";
import { FIELD_ERROR, HELP, inputClass, LABEL, textareaClass } from "./ui-classes";

// 추가 모달과 수정 폼이 함께 쓰는 이름·설명 입력 (ui.md 4.4)
export function CategoryFormFields({
  idPrefix,
  state,
  defaults,
  autoFocus,
}: {
  idPrefix: string;
  state: CategoryFormState;
  defaults?: { name: string; description: string };
  autoFocus?: boolean;
}) {
  const failed = state && !state.ok ? state : null;
  // 실패하면 방금 입력한 값을, 아니면 기존 값을 보여준다
  const values = failed?.values ?? defaults ?? { name: "", description: "" };
  const nameError = failed?.fieldErrors?.name;
  const descriptionError = failed?.fieldErrors?.description;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label htmlFor={`${idPrefix}-name`} className={LABEL}>
          이름 <span className="text-danger">*</span>
        </label>
        <input
          id={`${idPrefix}-name`}
          name="name"
          required
          maxLength={20}
          autoFocus={autoFocus}
          defaultValue={values.name}
          placeholder="예: 모델·연구"
          aria-invalid={nameError ? true : undefined}
          aria-describedby={nameError ? `${idPrefix}-name-error` : undefined}
          className={inputClass(Boolean(nameError))}
        />
        {nameError && (
          <p id={`${idPrefix}-name-error`} className={FIELD_ERROR}>
            {nameError}
          </p>
        )}
      </div>

      <div>
        <label htmlFor={`${idPrefix}-description`} className={LABEL}>
          설명
        </label>
        <textarea
          id={`${idPrefix}-description`}
          name="description"
          maxLength={200}
          rows={2}
          defaultValue={values.description}
          placeholder="예: AI 모델 출시와 성능 비교, 논문과 연구 성과"
          aria-invalid={descriptionError ? true : undefined}
          aria-describedby={`${idPrefix}-description-help${descriptionError ? ` ${idPrefix}-description-error` : ""}`}
          className={textareaClass(Boolean(descriptionError))}
        />
        {descriptionError && (
          <p id={`${idPrefix}-description-error`} className={FIELD_ERROR}>
            {descriptionError}
          </p>
        )}
        <p id={`${idPrefix}-description-help`} className={HELP}>
          AI가 기사를 분류할 때 참고해요. 새로 가져오는 기사부터 적용돼요.
        </p>
      </div>

      {failed?.error && (
        <p role="alert" className="text-sm text-danger">
          {failed.error}
        </p>
      )}
    </div>
  );
}
