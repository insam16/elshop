export const metadata = { title: "이용약관 | 엘샵" };

export default function TermsPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <PolicyLayout title="이용약관" effectiveDate="2026년 4월 21일">
        <Section title="제1조 목적">
          <p>
            본 약관은 엘샵(이하 "서비스")이 제공하는 엘소드 아이템 거래 게시판 서비스의 이용 조건 및 절차, 이용자와 서비스 간의 권리·의무 관계를 규정함을 목적으로 합니다.
          </p>
        </Section>

        <Section title="제2조 서비스 이용">
          <ul>
            <li>서비스는 네이버 소셜 로그인을 통해 회원가입 없이 이용할 수 있습니다.</li>
            <li>서비스는 거래 게시판 플랫폼을 제공할 뿐, 실제 거래 당사자가 아닙니다.</li>
            <li>서비스는 이용자 간 거래의 안전성을 보증하지 않습니다.</li>
          </ul>
        </Section>

        <Section title="제3조 이용 자격 및 청소년 보호">
          <ul>
            <li>
              만 19세 미만의 미성년자는 「청소년 보호법」에 따라 서비스를 이용할 수 없습니다.
              서비스는 네이버 계정의 생년월일 정보를 활용하여 미성년자의 가입을 기술적으로 차단합니다.
            </li>
          </ul>
        </Section>

        <Section title="제4조 금지 행위">
          <p>이용자는 다음 행위를 할 수 없습니다.</p>
          <ul>
            <li>타인의 개인정보 게시 또는 도용</li>
            <li>허위 거래 정보 작성 (사기 행위)</li>
            <li>욕설, 혐오 표현, 음란물 게시</li>
            <li>서비스 운영을 방해하는 행위</li>
            <li>불법적 거래 알선</li>
            <li>동일 게시글 반복 도배</li>
          </ul>
        </Section>

        <Section title="제5조 게시물">
          <ul>
            <li>게시물의 저작권은 작성자에게 있습니다.</li>
            <li>작성자는 게시물이 타인의 권리를 침해하지 않음을 보증합니다.</li>
            <li>서비스는 운영 정책 위반 게시물을 사전 통보 없이 삭제할 수 있습니다.</li>
            <li>삭제된 게시글은 복구되지 않을 수 있습니다.</li>
          </ul>
        </Section>

        <Section title="제6조 이용 제한">
          <p>
            서비스는 이용자가 본 약관을 위반한 경우 경고, 게시글 삭제, 서비스 이용 제한 등의
            조치를 취할 수 있습니다. 제재 기준은 별도 운영 정책을 따릅니다.
          </p>
        </Section>

        <Section title="제7조 면책">
          <ul>
            <li>서비스는 이용자 간 거래에서 발생하는 분쟁에 책임지지 않습니다.</li>
            <li>서비스는 천재지변, 서버 장애 등 불가항력으로 인한 손해에 책임지지 않습니다.</li>
            <li>이용자가 게시한 정보의 정확성에 대해 서비스는 보증하지 않습니다.</li>
          </ul>
        </Section>

        <Section title="제8조 약관 변경">
          <p>
            약관이 변경되는 경우 서비스 내 공지를 통해 사전 고지합니다.
            변경된 약관에 동의하지 않으면 서비스 이용을 중단할 수 있습니다.
          </p>
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
