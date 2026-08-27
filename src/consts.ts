// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.

export const SITE_TITLE = 'console.log(history)';
export const SITE_DESCRIPTION = '개발과 투자, 두 갈래의 기록.';

export const CATEGORIES = {
	dev: {
		label: 'console.log(dev)',
		description: '만들면서 막힌 지점과 그걸 푼 방법.',
	},
	invest: {
		label: 'console.log(invest)',
		description: '기업과 거시 지표를 읽고 남기는 판단의 기록.',
	},
} as const;

export type Category = keyof typeof CATEGORIES;

export const CATEGORY_KEYS = Object.keys(CATEGORIES) as Category[];

// 홈의 각 카테고리 카드에 미리 보여줄 최신 글 수.
export const CARD_PREVIEW_COUNT = 3;
