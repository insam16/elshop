import Link from "next/link";

export const metadata = { title: "사기 예방 안내 | 엘샵" };

function Section({ number, title, examples, warning }: {
  number: number;
  title: string;
  examples: string[];
  warning: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="font-semibold">{number}. {title}</p>
      <ul className="flex flex-col gap-0.5 text-muted-foreground pl-3">
        {examples.map((ex) => (
          <li key={ex}>"{ex}"</li>
        ))}
      </ul>
      <p className="text-muted-foreground pl-3 border-l-2 border-amber-300">→ {warning}</p>
    </div>
  );
}

export default function Notice2Page() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-4">
        <Link href="/notice" className="text-sm text-muted-foreground hover:text-primary-base transition-colors">
          ← 공지사항
        </Link>
      </div>

      <div className="card">
        <h1 className="text-xl font-bold mb-1">사기 예방 가이드</h1>
        <p className="text-sm text-muted-foreground mb-6">2026-04-29 15:00 · 관리자#늘춍</p>

        <div className="text-sm leading-relaxed flex flex-col gap-6 text-foreground">

          <p>
            최근 사기 사례가 지속적으로 발생하고 있습니다.<br />
            아래는 실제로 자주 발생하는 사기 유형을 정리한 내용입니다.
          </p>

          <div className="flex flex-col gap-5">
            <Section
              number={1}
              title='"급처" + 시세보다 지나치게 저렴한 거래'
              examples={["급하게 팔아요", "지금 바로 거래하면 싸게 드림"]}
              warning="정상적인 거래보다 가격이 비정상적으로 낮은 경우, 사기일 가능성이 매우 높습니다."
            />
            <Section
              number={2}
              title="댓글 없이 외부 수단으로 연락"
              examples={["님 그거 파시죠? 삽니다"]}
              warning="사이트 밖으로 유도하는 경우 기록이 남지 않아 사기 대응이 어렵습니다."
            />
            <Section
              number={3}
              title="거래를 지나치게 재촉"
              examples={["지금 아니면 안 됨", "다른 사람도 보고 있음 빨리 결정"]}
              warning="판단할 시간을 주지 않는 것은 대표적인 사기 수법입니다."
            />
            <Section
              number={4}
              title="인증 회피 또는 거부"
              examples={["아이템 인증 요청 시 회피/거절"]}
              warning="정상적인 판매자는 기본적인 인증 요청을 거부하지 않습니다."
            />
            <Section
              number={5}
              title="활동 이력이 없거나 인증되지 않은 계정"
              examples={["생성된 지 얼마 안 된 계정", "글 / 댓글 기록 없음"]}
              warning="신규 계정일수록 주의가 필요합니다."
            />
          </div>

          <div className="border-t border-border-base pt-5 flex flex-col gap-3">
            <p className="font-semibold">안전하게 거래하는 방법</p>

            <div className="flex flex-col gap-1">
              <p className="text-muted-foreground font-medium">반드시 확인하세요</p>
              <ul className="list-disc list-inside flex flex-col gap-0.5 text-muted-foreground pl-2">
                <li>상대방의 활동 이력</li>
                <li>인증 여부</li>
                <li>이전 거래 기록</li>
              </ul>
            </div>

            <div className="flex flex-col gap-1">
              <p className="text-muted-foreground font-medium">가능하면</p>
              <ul className="list-disc list-inside flex flex-col gap-0.5 text-muted-foreground pl-2">
                <li>여러 정보를 비교 후 거래</li>
                <li>급하게 결정하지 않기</li>
              </ul>
            </div>

            <div className="flex flex-col gap-1">
              <p className="text-muted-foreground font-medium">피해야 할 행동</p>
              <ul className="list-disc list-inside flex flex-col gap-0.5 text-muted-foreground pl-2">
                <li>외부 메신저로만 거래 진행</li>
                <li>물건 확인 전 입금</li>
              </ul>
            </div>
          </div>

          <p className="text-muted-foreground border-l-2 border-border-base pl-3">
            ※ 엘샵은 거래를 직접 중개하지 않습니다.<br />
            모든 거래는 이용자 간에 이루어지며, 책임은 당사자에게 있습니다.
          </p>

          <p>여러분의 주의가 가장 중요한 안전장치입니다.<br />감사합니다.</p>
        </div>
      </div>
    </div>
  );
}
