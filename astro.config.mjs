// @ts-check

import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import { defineConfig, fontProviders } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	site: 'https://consoleloghistory.blog',
	integrations: [mdx(), react(), sitemap()],
	fonts: [
		// 본문 공통. 한글 글리프가 있는 폰트여야 한다 (Atkinson에는 없어서 한글이 시스템 폰트로 떨어졌다).
		{
			provider: fontProviders.google(),
			name: 'IBM Plex Sans KR',
			cssVariable: '--font-sans',
			weights: [400, 600, 700],
			subsets: ['latin', 'korean'],
			fallbacks: ['-apple-system', 'BlinkMacSystemFont', 'Apple SD Gothic Neo', 'sans-serif'],
		},
		// dev 라벨 전용. 라틴만 들어가는 자리에만 쓴다 (한글 글리프가 없다).
		{
			provider: fontProviders.google(),
			name: 'IBM Plex Mono',
			cssVariable: '--font-mono',
			weights: [500, 600],
			subsets: ['latin'],
			fallbacks: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
		},
	],
});
