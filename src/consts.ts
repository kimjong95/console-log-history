// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.

export const SITE_TITLE = 'console.log(history)';
export const SITE_DESCRIPTION = '개발과 투자, 그리고 그 밖의 기록.';

export const CATEGORIES = {
	dev: {
		label: 'console.log(dev)',
		description: '만들면서 막힌 지점과 그걸 푼 방법.',
	},
	invest: {
		label: 'console.log(invest)',
		description: '기업과 거시 지표를 읽고 남기는 판단의 기록.',
	},
	others: {
		label: 'console.log(others)',
		description: '개발도 투자도 아닌, 그 밖의 기록.',
	},
} as const;

export type Category = keyof typeof CATEGORIES;

export const CATEGORY_KEYS = Object.keys(CATEGORIES) as Category[];

// 홈의 각 카테고리 카드에 미리 보여줄 최신 글 수.
export const CARD_PREVIEW_COUNT = 3;

// 투자 글에 붙는 고정 면책 문구. 동기화 스크립트가 자동으로 넣는다.
// 사람이 매번 적는 규칙은 언젠가 빠지므로, 넣는 주체를 스크립트로 옮겼다.
export const INVEST_DISCLAIMER =
	'이 글은 개인의 의견이며 투자 권유가 아닙니다. 모든 투자 판단과 그 책임은 투자자 본인에게 있습니다.';
