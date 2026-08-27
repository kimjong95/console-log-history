import { getCollection, type CollectionEntry } from 'astro:content';
import type { Category } from '../consts';

export type Post = CollectionEntry<'blog'>;

/**
 * 발행 대상 글을 최신순으로 반환한다.
 * 초안은 프로덕션 빌드에서만 제외한다 — dev 서버에서는 쓰는 중인 글이 보여야 한다.
 */
export async function getPublishedPosts(category?: Category): Promise<Post[]> {
	const posts = await getCollection('blog', ({ data }) => {
		if (import.meta.env.PROD && data.draft) return false;
		return category ? data.category === category : true;
	});

	return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

/** 글의 정식 경로. 카테고리가 곧 첫 경로 조각이다. */
export function postPath(post: Post): string {
	return `/${post.data.category}/${post.id}/`;
}
