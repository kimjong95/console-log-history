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
| 호스팅 | Vercel |
| SSL | Let's Encrypt 자동 발급·갱신 |
| 저장소 | https://github.com/kimjong95/console-log-history (public) |

**미해결:** 도메인이 아직 이전 Vercel 프로젝트 `dev-blog`(Next.js)에 붙어 있다. 이 저장소로 옮겨야 하며, 그 과정에서 SSL 재발급 대기가 한 번 더 발생한다. `www` 서브도메인은 아직 인증서가 없다.

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

**Obsidian vault 연동: 지금은 안 한다**

vault(`~/Documents/Obsidian Vault`, md 약 175개)는 글감 자산이지만, 연동 파이프라인을 먼저 만들면 발행 경로 완성이 늦어진다. 데모 글을 저장소 `src/content/` 안에 직접 써서 발행 경로를 먼저 검증하고, 연동은 그 뒤에 별도로 설계한다. 투자 노트에 개인 포지션 등 비공개 정보가 섞일 수 있으므로, 나중에 붙일 때는 발행 전용 폴더 방식(`vault/blog/dev`, `vault/blog/invest`)을 기본안으로 둔다.

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

**목표: 데모 글 1편이 Vercel 임시 도메인에서 보이는 상태까지.**

1. `pnpm create astro@latest . --template blog` 로 스캐폴딩, `@astrojs/react` 추가
2. Content Collections 스키마 정의 — `category: 'dev' | 'invest'`, 투자 글은 면책 필드 필수
3. dev/invest 데모 글 각 1편 작성 (vault 연동 없이 저장소에서 직접)
4. 글 목록·상세·카테고리 라우트, RSS·sitemap
5. 첫 커밋·push (`git config user.email`이 개인 계정인지 확인)
6. Vercel 새 프로젝트 연결, 임시 도메인으로 배포 확인
7. `dev-blog`에서 도메인 이전, `www` 포함 SSL 재발급 확인

이후(범위 밖): 스킨 분리 → 글 15~25편 축적 → 애드센스 준비 페이지·`ads.txt` → 신청 → vault 연동 파이프라인
