export function getNicknameLength(nickname: string) {
	let length = 0;

	for (const ch of nickname) {
		if (/[가-힣]/.test(ch)) {
			length += 2;
		} else {
			length += 1;
		}
	}

	return length;
}

export function validateNickname(nickname: string): string | null {
	if (!nickname) {
		return "닉네임을 입력해주세요.";
	}

	const regex = /^[가-힣a-zA-Z0-9]+(@[SG])?$/;
	if (!regex.test(nickname)) {
		return "한글, 영문, 숫자만 가능하며 맨 뒤에만 @S 또는 @G를 붙일 수 있습니다.";
	}

	if (nickname.includes("@")) {
		const parts = nickname.split("@");

		if (parts.length !== 2) {
			return "@는 한 번만 사용할 수 있습니다.";
		}

		const [front, back] = parts;

		if (!front) {
			return "@ 앞에는 최소 1자 이상 있어야 합니다.";
		}

		if (back !== "S" && back !== "G") {
			return "@ 뒤에는 S 또는 G만 사용할 수 있습니다.";
		}
	}

	const length = getNicknameLength(nickname);

	if (length < 1) {
		return "닉네임은 최소 1자 이상이어야 합니다.";
	}

	if (length > 12) {
		return "닉네임은 최대 12자까지 가능합니다. (한글 1자=2)";
	}

	return null;
}
