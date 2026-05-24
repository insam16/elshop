import Link from "next/link";

export const metadata = { title: "엘소드 샵 오픈 안내드립니다 | 엘소드 샵" };

export default function Notice1Page() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-4">
        <Link href="/notice" className="text-sm text-muted-foreground hover:text-primary-base transition-colors">
          ← 공지사항
        </Link>
      </div>

      <div className="card">
        <h1 className="text-xl font-bold mb-1">엘소드 샵 오픈 안내드립니다</h1>
        <p className="text-sm text-muted-foreground mb-6">2026-04-28 15:00 · 관리자#늘춍</p>

        <div className="text-sm leading-relaxed flex flex-col gap-4 text-foreground">
          <p>안녕하세요.<br />엘소드 샵을 개발한 늘춍입니다.</p>

          <p>
            2026년 4월 18일, 엘소드몰 서비스 종료 소식을 접했습니다.<br />
            오랜 시간 많은 분들의 추억이 쌓여 있던 공간이었기에 개인적으로도 아쉬움이 컸습니다.
          </p>

          <p>
            그 아쉬움을 조금이나마 덜고자,<br />
            간단한 형태지만 거래 정보를 공유할 수 있는 공간인 엘소드 샵을 직접 제작하게 되었습니다.
          </p>

          <p className="text-muted-foreground border-l-2 border-border-base pl-3">
            ※ 엘소드 샵은 거래를 직접 중개하지 않습니다.<br />
            유저 간 거래 정보 공유를 위한 게시판 형태의 서비스입니다.<br />
            거래는 이용자 간에 이루어지며, 모든 책임은 당사자에게 있습니다.
          </p>

          <p>
            현재는 최소 기능만 갖춘 초기 서비스이며,<br />
            이용자분들이 보다 안전하게 거래할 수 있도록 지속적으로 개선해 나갈 예정입니다.
          </p>

          <div>
            <p className="mb-2">현재 이용 가능한 기능:</p>
            <ul className="list-disc list-inside flex flex-col gap-1 text-muted-foreground pl-1">
              <li>본캐 인증 시스템</li>
              <li>본캐 미인증 유저의 닉네임 설정 제한 및 게시글/댓글 작성 제한</li>
              <li>사기 예방 안내 및 신고 기능</li>
              <li>닉네임 클릭 시 해당 유저의 게시글/댓글 목록 확인</li>
            </ul>
          </div>

          <div>
            <p className="mb-2">추가로 준비 중인 기능:</p>
            <ul className="list-disc list-inside flex flex-col gap-1 text-muted-foreground pl-1">
              <li>거래 정보 및 후기 공유</li>
              <li>게시글 상단 고정 등 부가 기능</li>
              <li>서비스 안정성을 위한 서버 확장 및 운영 개선</li>
            </ul>
          </div>

          <p>
            서비스 운영에는 서버 비용 및 유지 비용이 지속적으로 발생하기 때문에,<br />
            추후 일부 기능은 유료로 제공될 수 있습니다.<br />
            기본적인 이용은 최대한 무료로 유지할 계획입니다.
          </p>

          <p>
            불편한 점이나 개선 의견은 언제든지 환영합니다.<br />
            빠른 문의는 카카오톡 오픈채팅으로,<br />
            버그 신고 / 기능 요청은 네이버폼으로 부탁드립니다.
          </p>

          <p>잘 부탁드립니다.<br />감사합니다.</p>
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
