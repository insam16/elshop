import Link from "next/link";

export const metadata = { title: "엘소드 샵 소개 | 엘소드 샵" };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="font-semibold">{title}</p>
      <div className="text-muted-foreground flex flex-col gap-1">{children}</div>
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-6">엘소드 샵 소개</h1>

      <div className="flex flex-col gap-4">

        {/* 만든 이유 */}
        <div className="card flex flex-col gap-4 text-sm leading-relaxed">
          <p className="font-semibold text-base">왜 만들었나요?</p>
          <p>
            엘소드 아이템 거래는 오랫동안 커뮤니티 기반으로 이루어져 왔습니다.<br />
            하지만 이 과정에서 다음과 같은 문제가 반복되었습니다.
          </p>
          <ul className="flex flex-col gap-1 text-muted-foreground list-disc list-inside pl-1">
            <li>댓글 → 답변 → 연락처까지 이어지는 긴 대기 구조</li>
            <li>거래 상대가 아닌 제3자에게도 연락처가 노출되는 구조</li>
            <li>오래된 거래글이 방치되는 문제</li>
            <li>사기 및 비매너 유저에 대한 대응 한계</li>
          </ul>
          <p>엘소드 샵은 이 문제를 해결하기 위해 시작되었습니다.</p>
        </div>

        {/* 해결 방식 */}
        <div className="card flex flex-col gap-5 text-sm leading-relaxed">
          <p className="font-semibold text-base">어떻게 해결하나요?</p>

          <Section title="🔗 대기 없는 거래">
            <p>클릭 한 번으로 거래 상대와 바로 연결됩니다.<br />댓글을 기다릴 필요가 없습니다.</p>
          </Section>

          <Section title="🔒 연락처 보호 시스템">
            <p><strong className="text-foreground">판매자 연락처</strong>: 게시글 내부에 안전하게 저장되며, "지금 연락하기"를 누른 단 한 명에게만 공개됩니다. 이후 시스템에서 자동 삭제됩니다.</p>
            <p><strong className="text-foreground">구매자 연락처</strong>: 판매자에게만 공개되며, 제3자에게는 노출되지 않습니다.</p>
          </Section>

          <Section title="⏱ 게시글 자동 만료">
            <p>거래글은 7일 후 자동으로 만료됩니다.<br />항상 최신 거래 정보만 목록에 표시됩니다.</p>
          </Section>

          <Section title="🛡 선택 인증 구조">
            <p>인증은 필수가 아닙니다. 인증 없이도 게시글 작성과 연락처 남기기가 가능합니다.</p>
            <p>단, <strong className="text-foreground">판매자 연락처 확인은 인증 유저만 가능</strong>합니다.<br />유입과 안전성 사이의 균형을 위한 선택입니다.</p>
            <Link href="/verify" className="text-primary-base hover:underline text-xs mt-1">본캐 인증 자세히 알아보기 →</Link>
          </Section>

          <Section title="🚨 신고 기반 관리">
            <p>유저 신고를 기반으로 운영되며, 문제 발생 시 빠르게 대응합니다.</p>
          </Section>
        </div>

        {/* 트레이드오프 */}
        <div className="card flex flex-col gap-3 text-sm leading-relaxed">
          <p className="font-semibold text-base">우리가 선택한 트레이드오프</p>
          <p className="text-muted-foreground">엘소드 샵은 모든 문제를 강하게 통제하기보다, 유입과 안전성 사이의 균형을 선택했습니다.</p>
          <div className="flex flex-col gap-1 text-muted-foreground">
            <p>인증 필수화 ❌ → 인증 선택화 ⭕ (유입 유지 + 신뢰 선택적 확보)</p>
            <p>강한 사전 검열 ❌ → 신고 기반 대응 ⭕ (유연한 운영)</p>
          </div>
        </div>

        {/* 운영 원칙 */}
        <div className="card flex flex-col gap-3 text-sm">
          <p className="font-semibold text-base">운영 원칙</p>
          <ul className="flex flex-col gap-1 text-muted-foreground list-disc list-inside pl-1">
            <li>거래를 방해하지 않는 최소한의 개입</li>
            <li>명확한 기준에 따른 신고 처리</li>
            <li>유저 피드백을 적극 반영</li>
          </ul>
        </div>

        <div className="text-center pt-2">
          <Link
            href="/posts"
            className="bg-primary-base text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity inline-block"
          >
            지금 거래 시작하기 →
          </Link>
        </div>

      </div>
    </div>
  );
}
