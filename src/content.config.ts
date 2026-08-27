import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { CATEGORY_KEYS, type Category } from './consts';

// 카테고리의 단일 출처는 consts.ts의 CATEGORIES다.
// 여기에 따로 나열하면 라우팅·동기화와 어긋난다.
const categoryEnum = z.enum(CATEGORY_KEYS as [Category, ...Category[]]);

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: ({ image }) =>
		z
			.object({
				title: z.string(),
				description: z.string(),
				// Transform string to Date object
				pubDate: z.coerce.date(),
				updatedDate: z.coerce.date().optional(),
				heroImage: z.optional(image()),
				category: categoryEnum,
				draft: z.boolean().default(false),
				// 투자 글에만 필수. 아래 superRefine에서 강제한다.
				disclaimer: z.string().optional(),
			})
			.superRefine((data, ctx) => {
				// 국내에서 불특정 다수 대상 투자 조언은 유사투자자문업 신고 대상이 될 수 있다.
				// 면책 문구 누락을 런타임이 아니라 빌드 타임에 막는다.
				if (data.category === 'invest' && !data.disclaimer?.trim()) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						path: ['disclaimer'],
						message: '투자 글에는 disclaimer가 필요합니다 (개인 의견이며 투자 권유가 아님을 명시).',
					});
				}
			}),
});

export const collections = { blog };
