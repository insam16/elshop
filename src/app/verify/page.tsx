import Link from "next/link";
import { auth } from "@/auth";
import VerifyCopyButton from "@/app/account/_components/VerifyCopyButton";

export const metadata = { title: "본캐 인증 안내 | 엘샵" };

export default async function VerifyPage() {
  const session = await auth();
  const isTemp = session?.user.role === "TEMP";
  const nickname = session?.user.nickname ?? "";

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-6">본캐 인증 안내</h1>

      <div className="flex flex-col gap-4">

        {/* 한 줄 요약 */}
        <div className="card">
          <p className="text-sm leading-relaxed">
            엘샵은 인증 없이도 대부분의 기능을 이용할 수 있습니다.<br />
            다만, <strong>게시글 작성자의 연락처 확인은 인증 유저에게만 제공됩니다.</strong>
          </p>
        </div>

        {/* 인증 전후 비교 */}
        <div className="card flex flex-col gap-4">
          <p className="font-semibold">인증 전 / 후 비교</p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex flex-col gap-2">
              <p className="font-medium text-muted-foreground">인증대기</p>
              <ul className="flex flex-col gap-1 text-muted-foreground">
                <li>✓ 게시글 열람</li>
                <li>✓ 게시글 작성 (하루 1개)</li>
                <li>✓ 댓글 작성 (하루 3개)</li>
                <li>✓ 연락처 남기기</li>
                <li className="text-red-400">✗ 판매자 연락처 확인</li>
              </ul>
            </div>
            <div className="flex flex-col gap-2">
              <p className="font-medium text-primary-base">인증 완료</p>
              <ul className="flex flex-col gap-1">
                <li>✓ 본캐 닉네임으로 변경</li>
                <li>✓ 게시글 작성 (제한 없음)</li>
                <li>✓ 댓글 작성 (제한 없음)</li>
                <li>✓ 연락처 남기기</li>
                <li>✓ 판매자 연락처 확인</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 인증 절차 */}
        <div className="card flex flex-col gap-4">
          <p className="font-semibold">인증 절차</p>
          <ol className="flex flex-col gap-3 text-sm">
            <li className="flex gap-3">
              <span className="shrink-0 w-5 h-5 rounded-full bg-primary-base text-primary-foreground text-xs flex items-center justify-center font-bold">1</span>
              <span className="flex flex-col gap-1.5">
                <span>아래 인증 문구를 복사합니다.</span>
                {isTemp ? (
                  <VerifyCopyButton nickname={nickname} />
                ) : (
                  <span className="text-muted-foreground text-xs">인증대기 유저만 이용할 수 있습니다.</span>
                )}
              </span>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 w-5 h-5 rounded-full bg-primary-base text-primary-foreground text-xs flex items-center justify-center font-bold">2</span>
              <span>엘소드 게임에 접속 후 채팅창에 붙여넣습니다.</span>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 w-5 h-5 rounded-full bg-primary-base text-primary-foreground text-xs flex items-center justify-center font-bold">3</span>
              <span className="flex flex-col gap-1.5">
                <span><strong>초상화, 캐릭터 창(기본키 U), 채팅창</strong>이 모두 보이는 스크린샷을 찍습니다.</span>
                <span className="text-muted-foreground text-xs">네이버폼의 예시를 참고해주세요.</span>
              </span>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 w-5 h-5 rounded-full bg-primary-base text-primary-foreground text-xs flex items-center justify-center font-bold">4</span>
              <span className="flex flex-col gap-1.5">
                <span>네이버폼에 스크린샷과 캐릭터명을 제출합니다.</span>
                <a
                  href="https://naver.me/GJZXxRFd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-primary-base text-primary-foreground text-center px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  인증 신청 네이버폼 →
                </a>
              </span>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 w-5 h-5 rounded-full bg-primary-base text-primary-foreground text-xs flex items-center justify-center font-bold">5</span>
              <span>관리자 검토 후 승인되면 캐릭터명으로 닉네임이 변경되고 인증이 완료됩니다.</span>
            </li>
          </ol>
          <p className="text-xs text-muted-foreground">승인까지 최대 24시간이 소요될 수 있습니다. </p>
        </div>

        {/* FAQ */}
        <div className="card flex flex-col gap-4">
          <p className="font-semibold">자주 묻는 질문</p>
          <div className="flex flex-col gap-4 text-sm">
            <div className="flex flex-col gap-1">
              <p className="font-medium">Q. 인증을 꼭 해야 하나요?</p>
              <p className="text-muted-foreground">아니요. 인증 없이도 게시글 작성과 연락처 남기기가 가능합니다. 판매자 연락처 확인만 인증 유저에게 제한됩니다.</p>
            </div>
            <div className="flex flex-col gap-1">
              <p className="font-medium">Q. 인증 완료 후 닉네임은 어떻게 되나요?</p>
              <p className="text-muted-foreground">제출한 엘소드 본캐 닉네임으로 변경됩니다.</p>
            </div>
            <div className="flex flex-col gap-1">
              <p className="font-medium">Q. 인증은 얼마나 유지되나요?</p>
              <p className="text-muted-foreground">인증은 탈퇴 전까지 유지됩니다. 다만 닉네임을 변경하셨다면, 재인증이 필요할 수 있습니다.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
