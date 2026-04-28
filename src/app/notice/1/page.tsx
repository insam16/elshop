import Link from "next/link";

export const metadata = { title: "엘샵 오픈 안내드립니다 | 엘샵" };

export default function Notice1Page() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-4">
        <Link href="/notice" className="text-sm text-muted-foreground hover:text-primary-base transition-colors">
          ← 공지사항
        </Link>
      </div>

      <div className="bg-card border border-border-base rounded-xl p-6">
        <h1 className="text-xl font-bold mb-1">엘샵 오픈 안내드립니다</h1>
        <p className="text-sm text-muted-foreground mb-6">2026-04-28 · 늘춍</p>

        <div className="text-sm leading-relaxed flex flex-col gap-4 text-foreground">
          <p>안녕하세요.<br />엘샵을 개발한 늘춍입니다.</p>

          <p>
            2026년 4월 18일, 엘소드몰 서비스 종료 소식을 접했습니다.<br />
            오랜 시간 많은 분들의 추억이 쌓여 있던 공간이었기에 개인적으로도 아쉬움이 컸습니다.
          </p>

          <p>
            그 아쉬움을 조금이나마 덜고자,<br />
            간단한 형태지만 대체 거래 공간인 엘샵을 직접 제작하게 되었습니다.
          </p>

          <p>
            현재는 최소 기능만 갖춘 임시 서비스이지만,<br />
            이용자분들이 불편 없이 거래할 수 있도록 지속적으로 개선해 나갈 예정입니다.
          </p>

          <div>
            <p className="mb-2">앞으로는 다음과 같은 기능들을 고려하고 있습니다:</p>
            <ul className="list-disc list-inside flex flex-col gap-1 text-muted-foreground pl-1">
              <li>사기 피해를 줄이기 위한 안전 거래 시스템</li>
              <li>게시글 상단 고정 등 부가 기능</li>
              <li>서비스 안정성을 위한 서버 확장 및 운영 개선</li>
            </ul>
          </div>

          <p>
            서비스 운영에는 서버 비용, 유지 비용, 그리고 개발 리소스가 지속적으로 소요되기 때문에,<br />
            추후 일부 유료 기능이 생길 수 있는 점 양해 부탁드립니다.<br />
            기본적인 이용은 최대한 무료로 유지할 계획입니다.
          </p>

          <p>
            부족한 점이 많겠지만,<br />
            여러분의 피드백을 바탕으로 더 나은 서비스로 발전시켜 나가겠습니다.<br />
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
          <a
            href="https://naver.me/GJZXxRFd"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between border border-border-base bg-muted/40 rounded-lg px-4 py-3 hover:bg-muted transition-colors group text-sm"
          >
            <span>본캐 인증 — 네이버폼</span>
            <svg className="w-3.5 h-3.5 text-muted-foreground shrink-0 ml-2 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
