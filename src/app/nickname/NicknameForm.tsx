"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

type FormState = {
    error: string;
};

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className="bg-primary-base text-primary-foreground py-2 rounded-lg hover:opacity-90 transition-opacity text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {pending ? "설정 중..." : "설정 완료"}
        </button>
    );
}

const initialState: FormState = {
    error: "",
};

export default function NicknameForm({
    action,
}: {
    action: (prevState: FormState, formData: FormData) => Promise<FormState>;
}) {
    const [state, formAction] = useActionState(action, initialState);

    return (
        <form
            action={formAction}
            className="bg-card border border-border-base rounded-xl p-6 flex flex-col gap-4"
        >
            <div>
                <label htmlFor="nickname" className="block text-sm font-medium mb-1">
                    닉네임
                </label>

                <input
                    id="nickname"
                    type="text"
                    name="nickname"
                    required
                    placeholder="1~12 (한글 2, 영문/숫자 1, @S/@G 허용)"
                    className="w-full bg-card border border-border-base rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-base transition-all"
                />

                {state.error && (
                    <p className="text-red-500 text-sm mt-1">{state.error}</p>
                )}

                <p className="text-xs text-muted-foreground mt-1">
                    한글, 영문, 숫자만 가능하며 예외적으로 맨 뒤에 @S 또는 @G를 붙일 수 있습니다.
                </p>
            </div>

            <SubmitButton />
        </form>
    );
}