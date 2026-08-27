---
title: 'Astro로 블로그를 새로 세우며 만난 것들'
description: 'blog 템플릿 스캐폴딩부터 테마 토큰 도입까지, 처음 하루의 기록.'
pubDate: 2026-08-27
category: dev
---

블로그를 다시 세우기로 하고 Astro를 골랐다. 마크다운이 1급 시민이고, 기본 JS가 0이라는 두 가지가 결정적이었다.

## pnpm workspace 함정

`astro add react`가 이유 없이 실패했다. 메시지는 이랬다.

```
ERROR  packages field missing or empty
```

템플릿이 만들어준 `pnpm-workspace.yaml`에 `allowBuilds`만 있고 `packages` 필드가 없어서, pnpm 10이 이 디렉터리를 워크스페이스 루트로 보면서도 대상 패키지를 못 찾는 상태였다. `packages: - .` 한 줄로 풀렸다.

## 테마를 나중에 얹지 않기

색을 하드코딩해두면 나중에 스킨을 나눌 때 전면 리팩터링이 된다. 그래서 스킨 작업 자체는 미루더라도 토큰 구조는 처음부터 잡았다.

```css
:root {
	--theme-accent: var(--accent);
}
[data-theme='dev'] {
	--theme-accent: #0f8a4f;
}
```

값을 덮어쓰는 지점이 한 곳이면 스킨은 나중에 언제든 붙는다.
