export const metadata = { title: "개인정보처리방침 | 엘소드 샵" };

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <PolicyLayout title="개인정보처리방침" effectiveDate="2026년 4월 29일">

        <Section title="1. 수집하는 개인정보">
          <p className="mb-2">서비스는 다음 정보를 수집합니다.</p>
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
                <td className="px-3 py-2">네이버 계정 식별자 (암호화), 탈퇴 전 닉네임</td>
                <td className="px-3 py-2">재가입 방지 / 부정 이용 방지</td>
                <td className="px-3 py-2">탈퇴 후 1년 (신고·부정 이용 확인 시 3년)</td>
              </tr>
              <tr>
                <td className="px-3 py-2">게시글, 댓글</td>
                <td className="px-3 py-2">게시판 서비스 제공</td>
                <td className="px-3 py-2">탈퇴 후에도 유지 (삭제 요청 시 처리)</td>
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
            </tbody>
          </table>
        </Section>

        <Section title="5. 이용자의 권리">
          <p>이용자는 언제든지 다음 권리를 행사할 수 있습니다.</p>
          <ul>
            <li>개인정보 열람 요청</li>
            <li>개인정보 수정·삭제 요청</li>
            <li>개인정보 처리 정지 요청</li>
            <li>
              회원 탈퇴 — 탈퇴 시 닉네임은 <strong>탈퇴#식별자</strong> 형태로 익명화되며,
              암호화된 계정 식별자와 탈퇴 전 닉네임은 별도 보안 저장소에 보관됩니다.
              (일반: 1년 / 신고·부정 이용 확인 시: 3년)
            </li>
            <li>게시글·댓글은 탈퇴 후에도 유지되며, 별도 삭제를 요청할 수 있습니다.</li>
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
          <p>개인정보 처리에 관한 문의는 아래 책임자에게 연락해 주세요.</p>
          <ul className="mt-1">
            <li>성명: 나유민</li>
            <li>이메일: wsand316@gmail.com</li>
          </ul>
        </Section>

        <Section title="11. 부정 이용 방지를 위한 정보 보관">
          <p className="mb-2">
            회사는 부정 이용 방지 및 분쟁 대응, 수사 협조를 위하여 외부 인증 서비스로부터 제공받은 이용자
            식별자를 암호화하여 보관할 수 있습니다.
          </p>
          <p className="mb-2">
            또한 동일 이용자의 재가입 방지 및 사기 이력 확인을 위하여 필요한 경우에 한하여, 이전 닉네임 등
            식별 가능 정보의 일부를 최소한의 범위 내에서 제한적으로 보관할 수 있습니다.
          </p>
          <ul>
            <li>일반 이용자의 경우: 탈퇴 후 최대 1년</li>
            <li>신고 또는 부정 이용이 확인된 경우: 분쟁 대응 및 수사 협조를 위하여 최대 3년까지 보관될 수 있습니다.</li>
          </ul>
          <p className="mt-2">
            해당 정보는 일반 서비스 이용 정보와 분리된 별도의 저장소에 안전하게 보관되며, 접근 권한이
            제한됩니다. 보관 기간 경과 시 해당 정보는 지체 없이 파기됩니다.
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
    <div className="card md:p-8">
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
