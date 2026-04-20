export const metadata = { title: "운영 정책 | 엘샵" };

export default function PolicyPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <PolicyLayout title="신고 및 제재 운영 정책" effectiveDate="2026년 4월 18일">

        <Section title="1. 신고 접수 및 처리">
          <ul>
            <li>신고는 로그인한 이용자 누구나 제출할 수 있습니다.</li>
            <li>동일 게시글에 대한 중복 신고는 1인 1회로 제한합니다.</li>
            <li>자신의 게시글은 신고할 수 없습니다.</li>
            <li>허위 신고가 반복되는 경우 신고자에게도 제재가 가해질 수 있습니다.</li>
          </ul>
        </Section>

        <Section title="2. 신고 처리 기준">
          <table className="w-full text-xs border border-border-base rounded-lg overflow-hidden">
            <thead className="bg-muted">
              <tr>
                <th className="px-3 py-2 text-left font-medium">신고 사유</th>
                <th className="px-3 py-2 text-left font-medium">처리 기준</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-base">
              <tr>
                <td className="px-3 py-2">사기</td>
                <td className="px-3 py-2">즉시 삭제 + 이용 정지 검토</td>
              </tr>
              <tr>
                <td className="px-3 py-2">허위 정보</td>
                <td className="px-3 py-2">경고 후 수정 요청 또는 삭제</td>
              </tr>
              <tr>
                <td className="px-3 py-2">부적절한 내용</td>
                <td className="px-3 py-2">내용 검토 후 삭제</td>
              </tr>
              <tr>
                <td className="px-3 py-2">기타</td>
                <td className="px-3 py-2">개별 검토 후 판단</td>
              </tr>
            </tbody>
          </table>
        </Section>

        <Section title="3. 제재 단계">
          <ol className="list-decimal pl-4 flex flex-col gap-1">
            <li><strong>경고</strong> — 위반 사항 안내 및 시정 요청</li>
            <li><strong>게시글 삭제</strong> — 정책 위반 게시글 삭제 (복구 불가)</li>
            <li><strong>서비스 이용 제한</strong> — 반복 위반 시 게시 기능 제한</li>
            <li><strong>영구 이용 정지</strong> — 심각한 위반 또는 누적 제재</li>
          </ol>
          <p className="mt-2">
            제재 단계는 위반의 경중에 따라 건너뛸 수 있습니다.
            사기 등 심각한 위반은 1단계 없이 즉시 영구 정지될 수 있습니다.
          </p>
        </Section>

        <Section title="4. 신고 처리 소요 시간">
          <ul>
            <li>일반 신고: 접수 후 72시간 이내 검토</li>
            <li>사기·허위 정보 신고: 접수 후 24시간 이내 우선 검토</li>
            <li>처리 결과는 별도로 통보하지 않으나, 신고 상태로 확인 가능합니다.</li>
          </ul>
        </Section>

        <Section title="5. 이의 신청">
          <p>
            제재 처분에 이의가 있는 경우 서비스 운영자에게 이의 신청을 할 수 있습니다.
            이의 신청은 제재일로부터 7일 이내에 접수해야 합니다.
            운영자는 접수 후 72시간 이내에 검토 결과를 안내합니다.
          </p>
        </Section>

        <Section title="6. 운영 로그">
          <ul>
            <li>모든 관리자의 처리 행위(삭제·상태 변경 등)는 로그로 기록됩니다.</li>
            <li>로그에는 처리 시각, 관리자 정보, 처리 내용, 메모가 포함됩니다.</li>
            <li>로그는 1년간 보관 후 파기합니다.</li>
            <li>운영 로그는 분쟁 발생 시 증빙 자료로 활용될 수 있습니다.</li>
          </ul>
        </Section>

        <Section title="7. 거래 안전 수칙">
          <ul>
            <li>게시글에 계좌번호, 전화번호 등 개인정보를 직접 노출하지 마세요.</li>
            <li>댓글 없이 타 수단으로 먼저 거래를 시도하는 경우 사기의 가능성이 높으니 주의하세요.</li>
            <li>서비스는 이용자 간 거래에 관여하지 않으며 피해에 대해 책임지지 않습니다.</li>
            <li>의심스러운 거래는 신고 기능을 이용해 주세요.</li>
          </ul>
        </Section>

      </PolicyLayout>
    </div>
  );
}

function PolicyLayout({
  title,
  effectiveDate,
  children,
}: {
  title: string;
  effectiveDate: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-card border border-border-base rounded-xl p-6 md:p-8">
      <h1 className="text-2xl font-bold mb-1">{title}</h1>
      <p className="text-sm text-muted-foreground mb-8">시행일: {effectiveDate}</p>
      <div className="flex flex-col gap-6">{children}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-base font-semibold mb-2">{title}</h2>
      <div className="text-sm text-muted-foreground leading-relaxed [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-1">
        {children}
      </div>
    </section>
  );
}
