import Link from "next/link";

export const metadata = { title: "업데이트 v1.6 — 연락하기 | 엘소드 샵" };

export default function Notice3Page() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-4">
        <Link href="/notice" className="text-sm text-muted-foreground hover:text-primary-base transition-colors">
          ← 공지사항
        </Link>
      </div>

      <div className="card">
        <h1 className="text-xl font-bold mb-1">업데이트 v1.6 — 연락하기</h1>
        <p className="text-sm text-muted-foreground mb-6">2026-05-02 13:00 · 관리자#늘춍</p>

        <div className="text-sm leading-relaxed flex flex-col gap-6 text-foreground">

          <p>안녕하세요, 엘소드 샵 관리자 늘춍입니다.<br />오늘 여러 기능이 추가·변경되었습니다.</p>

          {/* 연락하기 */}
          <div className="flex flex-col gap-3 bg-pink-100 dark:bg-pink-900/50 border border-pink-300 dark:border-pink-500 rounded-xl px-4 py-4">
            <p className="font-semibold text-base"><span className="bg-pink-300 dark:bg-pink-500 px-1 rounded">★★ 연락하기 기능 추가 ★★</span></p>
            <p>
              게시글 작성 시 카카오톡 오픈채팅 링크를 연락처로 등록할 수 있습니다.<br />
              구매자가 "지금 연락하기" 버튼을 누르면 연락처가 <strong>1회만</strong> 공개되며,
              이후 자동으로 삭제됩니다.
            </p>
            <div className="flex flex-col gap-2 pl-1">
              <div className="flex flex-col gap-1">
                <p className="font-medium">판매자</p>
                <ul className="list-disc list-inside flex flex-col gap-0.5 text-muted-foreground pl-2">
                  <li>게시글 작성 시 카카오톡 오픈채팅 링크 입력</li>
                  <li>구매자가 연락처를 남기면 댓글에서 확인 가능</li>
                </ul>
              </div>
              <div className="flex flex-col gap-1">
                <p className="font-medium">구매자 (본캐 인증 완료)</p>
                <ul className="list-disc list-inside flex flex-col gap-0.5 text-muted-foreground pl-2">
                  <li>"지금 연락하기" 클릭 → 판매자 연락처 1회 표시</li>
                  <li>연락 즉시 게시글이 예약 상태로 전환됩니다</li>
                </ul>
              </div>
              <div className="flex flex-col gap-1">
                <p className="font-medium">구매자 (인증대기)</p>
                <ul className="list-disc list-inside flex flex-col gap-0.5 text-muted-foreground pl-2">
                  <li>내 카카오톡 오픈채팅 링크를 남기면 판매자가 연락합니다</li>

                </ul>
              </div>
            </div>
            <p className="text-muted-foreground border-l-2 border-border-base pl-3">
              연락처는 거래 상대방이 확인 시 자동으로 삭제됩니다.<br />
              연락처가 공개된 이후에는 다시 확인할 수 없으니 반드시 저장해두세요.
            </p>
          </div>

          {/* 게시글 만료 */}
          <div className="flex flex-col gap-2">
            <p className="font-semibold text-base">게시글 자동 만료</p>
            <p>
              게시글은 작성일로부터 <strong>7일 후</strong> 자동으로 만료됩니다.<br />
              단, "예약" 또는 "거래 완료" 상태인 게시글은 "거래 완료" 처리됩니다.
              만료된 게시글은 수정·댓글 작성이 불가합니다.
            </p>
          </div>

          {/* 댓글 삭제 요청 */}
          <div className="flex flex-col gap-2">
            <p className="font-semibold text-base">댓글 삭제 요청</p>
            <p>
              본인이 작성한 댓글·답글을 직접 삭제하는 기능이 삭제 요청 방식으로 변경되었습니다.<br />
              "삭제 요청" 버튼을 누르면 관리자가 검토 후 삭제를 처리합니다.
            </p>
          </div>

          {/* 기타 변경 */}
          <div className="flex flex-col gap-2">
            <p className="font-semibold text-base">기타 변경사항</p>
            <ul className="list-disc list-inside flex flex-col gap-1 text-muted-foreground pl-2">
              <li>본캐 인증 안내 화면에 인증 문구 복사 버튼 추가</li>
              <li>게시판 상단에 공지사항 목록 표시</li>
              <li>인증대기 계정 댓글 작성 제한 하루 2개 → 3개로 변경</li>
            </ul>
          </div>

          <p>
            이용 중 불편한 점이나 버그가 있으면 언제든지 알려주세요.<br />
            감사합니다.
          </p>

          {/* 이후 수정 사항 */}
          <div className="flex flex-col gap-2">
            <p className="font-semibold text-base">이후 수정 사항</p>
            <ul className="list-disc list-inside flex flex-col gap-1 text-muted-foreground pl-2">
              <li>05/04: 게시글 상태(완료/만료)에 따른 비활성 스타일 적용</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-border-base pt-5 flex flex-col gap-2">
          <a
            href="https://open.kakao.com/me/insam16"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between border border-border-base bg-muted/40 rounded-lg px-4 py-3 hover:bg-muted transition-colors group text-sm"
          >
            <span>빠른 문의 — 카카오톡 오픈채팅</span>
            <svg className="w-3.5 h-3.5 text-muted-foreground shrink-0 ml-2 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
          <a
            href="https://naver.me/GsB4618H"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between border border-border-base bg-muted/40 rounded-lg px-4 py-3 hover:bg-muted transition-colors group text-sm"
          >
            <span>버그 신고 / 기능 요청 — 네이버폼</span>
            <svg className="w-3.5 h-3.5 text-muted-foreground shrink-0 ml-2 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
