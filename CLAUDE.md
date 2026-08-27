# console.log(history)

개인 블로그. 개발 주제와 투자/금융 주제를 함께 다루며, 구글 애드센스를 붙일 예정이다.

## 현재 상태 (2026-08-27)

MVP 발행 경로 구현 완료. `pnpm build` 통과. 커밋은 스캐폴딩(f7380b9)까지만 되어 있고 이후 작업은 미커밋.

- 라우트: `/`(통합 홈) · `/dev` · `/dev/[slug]` · `/invest` · `/invest/[slug]` · `/about` · `/rss.xml` · sitemap
- 데모 글 dev·invest 각 1편. 템플릿 기본 글 5편은 삭제했다.
- `AGENTS.md`는 템플릿이 넣어준 Astro 일반 가이드다. 프로젝트 맥락은 이 파일이 기준.
- `pnpm-workspace.yaml`에 `packages: - .` 를 추가했다. 없으면 pnpm 10에서 `pnpm add`가 "packages field missing or empty"로 실패한다.

### 테마 구조

`global.css`의 `:root`에 `--theme-*` 토큰을 두고 `[data-theme="dev"|"invest"]`가 그 값만 덮어쓴다. `BaseLayout.astro`가 `theme` prop으로 `<html data-theme>`을 찍는다. 홈의 카테고리 카드는 카드 자체에 `data-theme`을 걸어 색을 미리 보여준다.

**한글 폰트 주의:** 템플릿 기본 Atkinson에는 한글 글리프가 없어 한글이 전부 시스템 폰트로 떨어졌다. 지금은 IBM Plex Sans KR(본문·제목) / IBM Plex Mono(dev 라벨) / Noto Serif KR(invest)로 교체했다.

- 모노는 `--theme-font-label`로 분리해 **라틴 전용 자리에만** 쓴다. 한글이 섞이는 제목에 쓰면 한글이 시스템 모노로 떨어진다.
- Astro는 자체 호스팅하면서 패밀리명에 해시를 붙인다(`IBM Plex Sans KR-8c7df719…`). `fallbacks`에 원래 이름을 적어봐야 매칭되지 않는다.
- 폴백 배열에 한글 지원 폰트(`Apple SD Gothic Neo` 등)를 넣으면 그게 웹폰트보다 먼저 한글을 가로챈다.
- 본문에 `word-break: keep-all`이 필요하다. 없으면 한글이 어절 중간에서 잘린다.

## ⚠️ 커밋 전 확인

이 저장소는 **개인 GitHub 계정(`kimjong95`)** 으로 커밋해야 한다. 회사 계정으로 커밋하면 안 된다.

`~/.gitconfig`의 `includeIf "gitdir:~/Desktop/official/"` 설정으로 자동 분리되어 있으므로 보통은 신경 쓸 필요가 없다. 다만 확인하려면:

```bash
git config user.email   # 51505451+kimjong95@users.noreply.github.com 이어야 함
```

- push는 전용 SSH 키(`~/.ssh/id_ed25519_personal`)를 쓴다. `gh` 활성 계정과 무관하게 동작한다.
- **`gh` CLI 명령은 경로별 분리가 안 된다.** 활성 계정이 회사 계정(`miridih-jhkim06`)이므로, 이 저장소에 `gh` 명령을 쓰려면 `gh auth switch -u kimjong95`로 전환해야 하고, 전환은 전역 상태를 바꾸므로 사용자에게 먼저 알린 뒤 하고 끝나면 되돌린다.

## 인프라

| 항목 | 값 |
|---|---|
| 도메인 | `consoleloghistory.blog` (가비아, 연 65,000원, 2026-08-27 등록) |
| DNS | 가비아 네임서버 유지. apex A → `216.198.79.1`, `www` CNAME → `cname.vercel-dns.com` |
| 호스팅 | Vercel — **계정 `kimjong95` / 스코프 `kimjong95s-projects` / 프로젝트 `console-log-history`** |
| 대표 주소 | apex. `www`는 308로 apex에 리다이렉트 |
| SSL | Let's Encrypt 자동 발급·갱신. apex·www 각각 발급됨 |
| 저장소 | https://github.com/kimjong95/console-log-history (public) |

## ⚠️ Vercel 계정 주의

**이 블로그는 `kimjong95` 계정에서만 운영한다.** 다른 계정(`mje807`)에도 Vercel이 있고, 2026-08-27에 도메인이 그쪽에 등록되는 바람에 반나절을 썼다. GitHub 계정 분리와 같은 이유로 여기도 갈라진다.

증상과 원인:

- Vercel의 Git Scope 목록은 **Vercel 계정에 연결된 GitHub 아이디**를 따른다. 브라우저에서 GitHub 계정을 바꿔도 목록은 바뀌지 않는다. `mje807` 계정에서는 `kimjong95` 소유 저장소가 public이어도 보이지 않는다.
- 도메인은 프로젝트가 아니라 **계정에 귀속**된다. 프로젝트를 삭제해도 도메인은 계정 레벨에 남아, 다른 계정에서 추가하려 하면 "다른 Vercel 계정에 연결되어 있습니다"로 막힌다.
- 계정 레벨 도메인 목록은 프로젝트 Settings가 아니라 대시보드 상단 **Domains** 탭에 있다 (`vercel.com/<scope>/~/domains`).

계정이 꼬였을 때는 대시보드를 헤매지 말고 CLI로 확정하는 게 빠르다.

```bash
npx vercel whoami
npx vercel teams ls
npx vercel domains ls --scope <스코프>
npx vercel domains rm <도메인> --scope <스코프> --yes
```

프로젝트 도메인의 **리다이렉트 방향은 CLI로 못 바꾼다.** REST API를 쓴다 (토큰은 `~/Library/Application Support/com.vercel.cli/auth.json`).

```bash
curl -X PATCH -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"redirect":"consoleloghistory.blog","redirectStatusCode":308}' \
  "https://api.vercel.com/v9/projects/console-log-history/domains/www.consoleloghistory.blog?teamId=kimjong95s-projects"
```

**`www`는 등록을 유지한다.** 대표 주소가 apex여도 `www`를 프로젝트에서 빼면 안 된다. DNS의 `www` CNAME은 그대로 Vercel을 가리키므로, 프로젝트에서 빠지는 순간 `www`로 들어온 방문자는 `DEPLOYMENT_NOT_FOUND`를 보게 된다. 308 리다이렉트로 남겨두는 것이 그 트래픽을 apex로 모으는 방법이다.

**apex 소유권 인증:** 가비아 네임서버를 쓰는 한 apex는 A 레코드만으로 인증되지 않고 `_vercel` TXT(`vc-domain-verify=...`)가 필요하다. 서브도메인(`www`)은 CNAME으로 자동 인증된다. apex가 미인증이면 Vercel이 인증된 `www`를 대표로 잡아 **apex → www 방향으로 리다이렉트가 뒤집힌다.** TXT는 인증 후 삭제해도 된다.

## 확정된 결정

**스택: Astro** (최신 7.2.8)

Next.js·React Router v7·워드프레스를 검토한 끝에 선택했다. 이유:
- 마크다운이 1급 시민이다. Content Collections로 frontmatter를 Zod 스키마로 검증하므로, 투자 글의 면책 문구 누락이나 초안 오발행을 빌드 타임에 막을 수 있다.
- 기본 JS가 0이라 애드센스 스크립트를 얹고도 Core Web Vitals에 여유가 있다. 투자 콘텐츠는 YMYL 영역이라 CWV가 검색 순위에 실제로 반영된다.
- `@astrojs/react`로 React 컴포넌트를 그대로 쓸 수 있어 기존 경험이 죽지 않는다. 투자 글의 차트 등은 island로 처리한다.

React Router v7은 별도 사이드 프로젝트로 다루고, 그 경험을 블로그 글감으로 쓰기로 했다. 블로그 자체를 실험장으로 삼으면 글을 못 쓰게 된다.

**브랜딩**

사이트 제목은 `console.log(history)`, 섹션별로 `console.log(dev)` / `console.log(invest)`.

**테마 분리 수준: 스킨만**

헤더·네비게이션·레이아웃은 공통이고 컬러와 타이포만 교체한다(dev = 그린/모노스페이스, invest = 앰버/세리프 방향). 별개 사이트로 나누지 않는 이유는 애드센스가 사이트 단위 승인이고, 초기에는 도메인 신뢰도를 한 곳에 모으는 편이 유리하기 때문이다. 투자 쪽이 커지면 나중에 분리를 검토한다.

**Obsidian vault 연동: 발행 전용 폴더 방식**

vault(`~/Documents/Obsidian Vault`)의 `blog/<카테고리>/` 폴더만 발행한다. `pnpm sync:vault`가 단방향으로 복사하며, vault가 원본이고 저장소는 발행본이다. 저장소에 손으로 쓰는 글은 없다.

```
vault/blog/<카테고리>/글.md   (title, description만 직접 작성)
  ↓  pnpm sync:vault
src/content/blog/<slug>.md
  ↓  git diff 확인 → 커밋 → 푸시 → 자동 배포
```

- `category`는 폴더명, `pubDate`는 `created`(없으면 파일 생성시각)에서 유도한다.
- **투자 글의 면책 문구는 스크립트가 자동으로 넣는다** (`INVEST_DISCLAIMER`). 사람이 매번 적는 규칙은 언젠가 빠지므로 넣는 주체를 옮겼다.
- **frontmatter는 화이트리스트**다(`title`, `description`, `draft`, `slug`, `created`, `updated`). vault에는 `participants`·`session_ids`·`source` 같은 회사·개인 메타데이터가 있어, 블랙리스트로 막으면 새 키가 생길 때마다 구멍이 난다. 버려진 키는 실행 시 콘솔에 나열된다.
- `[[위키링크]]`는 대상이 발행 대상이면 링크로, 아니면 평문화하고 목록을 출력한다.
- vault에서 사라진 글은 저장소에서도 지운다. 대상은 `.vault-sync.json` 매니페스트에 기록된 파일뿐이라, 매니페스트 밖의 파일은 건드리지 않는다.
- vault 경로는 `VAULT_DIR` 환경변수로 바꿀 수 있다. 발행 폴더가 없으면 만들지 않고 실패한다 — 경로가 틀렸을 때 빈 폴더를 만들고 "0건"으로 조용히 끝나면 원인을 찾기 어렵다.

**카테고리 추가는 `src/consts.ts`의 `CATEGORIES`에 한 줄이다.** 라우팅(`/[category]/`)·헤더 링크·스키마 enum·동기화 대상이 모두 여기서 유도된다. vault에 `blog/<키>` 폴더가 있는데 `CATEGORIES`에 없으면 동기화가 실패한다. 새 카테고리는 `global.css`에 `[data-theme]` 블록이 없으면 중립 테마 색으로 렌더링된다.

**MVP 범위: 최소 발행 경로만**

글 목록·상세·dev/invest 카테고리·RSS·sitemap까지. 스킨 전환과 애드센스는 글이 쌓인 뒤에 얹는다. "글 쓰면 배포된다"를 먼저 완성한다.

**도메인 이전: MVP 배포 후**

먼저 Vercel 임시 도메인으로 띄워 동작을 확인하고, 그다음 `dev-blog`에서 `consoleloghistory.blog`를 옮긴다. 이전 사이트가 살아 있는 동안 SSL 재발급 대기를 겪는 편이 낫다.

## 애드센스 준비사항

신청은 글이 쌓인 뒤다. 실무적으로 양질의 글 15~25개 이상이 있어야 승인이 안정적이다.

미리 갖출 것:
- 개인정보처리방침(쿠키·광고 문구 포함), 소개, 연락처 페이지 — 누락이 흔한 반려 사유다
- `public/ads.txt`
- 광고 슬롯 자리를 레이아웃에 미리 확보 (나중에 끼워넣으면 CLS가 나빠진다)
- 광고 스크립트 지연 로딩
- 다크모드에서 광고 배경이 튀는 문제 대비

**투자 글 관련 주의:** 국내에서 불특정 다수 대상 투자 조언은 유사투자자문업 신고 대상이 될 수 있다. 모든 투자 글에 면책 문구(개인 의견, 투자 권유 아님, 판단과 책임은 본인)를 고정하고, 직접적인 매수 추천 표현은 피한다. Content Collections 스키마에서 면책 필드를 필수로 강제하는 방안을 검토 중이다.

## 다음 작업

MVP 발행 경로와 배포는 끝났다. 다음은 글을 쌓는 단계다.

1. `www` 인증서 발급 확인 (기다리기만 하면 된다 — 위 인프라 섹션 참고)
2. 데모 글 2편을 실제 글로 교체하거나 그 위에 이어 쓰기
3. 글이 쌓이면 스킨 다듬기 → 애드센스 준비 페이지·`ads.txt` → 신청
4. vault 연동 파이프라인 설계 (발행 전용 폴더 방식이 기본안)

글쓰기를 막는 기술적 과제는 지금 없다. 3·4번은 글이 먼저 쌓인 뒤의 일이다.
