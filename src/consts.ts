// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.

export const SITE_TITLE = 'console.log(history)';
export const SITE_DESCRIPTION = '개발과 투자, 두 갈래의 기록.';

export const CATEGORIES = {
	dev: { label: 'console.log(dev)', description: '개발 기록' },
	invest: { label: 'console.log(invest)', description: '투자·금융 기록' },
} as const;

export type Category = keyof typeof CATEGORIES;
