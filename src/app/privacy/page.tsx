export const metadata = { title: "개인정보처리방침 | 엘샵" };

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <PolicyLayout title="개인정보처리방침" effectiveDate="2026년 4월 18일">

        <Section title="1. 수집하는 개인정보">
          <p className="mb-2">서비스는 네이버 소셜 로그인을 통해 다음 정보를 수집합니다.</p>
          <table className="w-full text-xs border border-border-base rounded-lg overflow-hidden">
            <thead className="bg-muted">
              <tr>
                <th className="px-3 py-2 text-left font-medium">항목</th>
                <th className="px-3 py-2 text-left font-medium">목적</th>
                <th className="px-3 py-2 text-left font-medium">보관 기간</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-base">
              <tr>
                <td className="px-3 py-2">이메일</td>
                <td className="px-3 py-2">회원 식별</td>
                <td className="px-3 py-2">탈퇴 후 즉시 삭제</td>
              </tr>
              <tr>
                <td className="px-3 py-2">닉네임 (직접 입력)</td>
                <td className="px-3 py-2">게시판 활동</td>
                <td className="px-3 py-2">탈퇴 후 즉시 삭제</td>
              </tr>
              <tr>
                <td className="px-3 py-2">소셜 프로필 이미지</td>
                <td className="px-3 py-2">UI 표시 (선택)</td>
                <td className="px-3 py-2">탈퇴 후 즉시 삭제</td>
              </tr>
              <tr>
                <td className="px-3 py-2">서비스 이용 기록</td>
                <td className="px-3 py-2">운영·보안</td>
                <td className="px-3 py-2">1년</td>
              </tr>
            </tbody>
          </table>
          <p className="mt-2 text-xs">
            ※ 서비스는 개인정보 최소 수집 원칙에 따라 서비스 운영에 필요한 최소한의 정보만 수집합니다.
          </p>
        </Section>

        <Section title="2. 개인정보의 이용">
          <ul>
            <li>회원 인증 및 서비스 제공</li>
            <li>게시판 운영 및 신고·제재 처리</li>
            <li>서비스 정책 위반 여부 확인</li>
            <li>법령에 따른 의무 이행</li>
          </ul>
          <p className="mt-2">수집한 개인정보는 위 목적 외에 사용하지 않습니다.</p>
        </Section>

        <Section title="3. 제3자 제공">
          <p>
            서비스는 이용자의 개인정보를 원칙적으로 제3자에게 제공하지 않습니다.
            단, 다음의 경우에는 예외로 합니다.
          </p>
          <ul>
            <li>이용자가 사전에 동의한 경우</li>
            <li>법령에 의거하여 수사기관 등이 요청하는 경우</li>
          </ul>
        </Section>

        <Section title="4. 개인정보 처리 위탁">
          <table className="w-full text-xs border border-border-base rounded-lg overflow-hidden">
            <thead className="bg-muted">
              <tr>
                <th className="px-3 py-2 text-left font-medium">수탁사</th>
                <th className="px-3 py-2 text-left font-medium">위탁 업무</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-base">
              <tr>
                <td className="px-3 py-2">Naver Corp.</td>
                <td className="px-3 py-2">소셜 로그인 인증</td>
              </tr>
              <tr>
                <td className="px-3 py-2">Vercel Inc. (예정)</td>
                <td className="px-3 py-2">서버 운영 및 데이터 저장</td>
              </tr>
            </tbody>
          </table>
        </Section>

        <Section title="5. 이용자의 권리">
          <p>이용자는 언제든지 다음 권리를 행사할 수 있습니다.</p>
          <ul>
            <li>개인정보 열람 요청</li>
            <li>개인정보 수정·삭제 요청</li>
            <li>개인정보 처리 정지 요청</li>
            <li>회원 탈퇴 (탈퇴 시 개인정보 즉시 삭제)</li>
          </ul>
          <p className="mt-2">권리 행사는 서비스 내 기능 또는 관리자 이메일로 요청할 수 있습니다.</p>
        </Section>

        <Section title="6. 관리자 로그 보관">
          <ul>
            <li>관리자의 신고 처리·게시글 삭제 등 모든 운영 조치는 로그로 기록됩니다.</li>
            <li>관리자 로그는 운영 투명성 확보를 위해 1년간 보관 후 삭제합니다.</li>
            <li>로그에는 처리 시각, 관리자 식별자, 처리 내용이 포함됩니다.</li>
          </ul>
        </Section>

        <Section title="7. 쿠키 및 세션">
          <p>
            서비스는 로그인 유지를 위해 세션 쿠키를 사용합니다.
            브라우저를 닫거나 로그아웃 시 세션이 만료됩니다.
          </p>
        </Section>

        <Section title="8. 개인정보 보호책임자">
          <p>
            개인정보 처리에 관한 문의는 서비스 운영자에게 연락해 주세요.
            신속하게 답변드리겠습니다.
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
