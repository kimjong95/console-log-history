/**
 * Obsidian vault의 발행 폴더를 저장소로 단방향 동기화한다.
 *
 *   vault/blog/<category>/*.md  →  src/content/blog/*.md
 *
 * vault가 원본이고 저장소는 발행본이다. 이 스크립트는 커밋하지 않는다 —
 * `git diff`로 무엇이 들어왔는지 확인하는 것이 공개 직전의 사람 개입 지점이다.
 */
import { existsSync } from 'node:fs';
import { mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import path from 'node:path';
import matter from 'gray-matter';
import { CATEGORIES, CATEGORY_KEYS, INVEST_DISCLAIMER, type Category } from '../src/consts';

const VAULT_DIR = process.env.VAULT_DIR ?? path.join(homedir(), 'Documents', 'Obsidian Vault');
const VAULT_BLOG_DIR = path.join(VAULT_DIR, 'blog');
const OUT_DIR = path.join(process.cwd(), 'src', 'content', 'blog');

/** 동기화가 만들어낸 파일 목록. 고아 정리 시 손으로 쓴 글을 지우지 않기 위해 쓴다. */
const MANIFEST = path.join(process.cwd(), '.vault-sync.json');

/**
 * vault 노트에서 읽어들이는 키. 여기 없는 키는 전부 버린다.
 *
 * 화이트리스트인 이유: vault에는 participants·session_ids·source 같은
 * 회사·개인 메타데이터가 있다. 블랙리스트로 막으면 vault에 새 키가 생길 때마다
 * 구멍이 나지만, 화이트리스트는 기본이 차단이라 그 위험이 없다.
 *
 * 실제 차단은 buildFrontmatter가 출력을 처음부터 새로 구성하는 것으로 이루어진다.
 * 이 목록은 무엇이 버려졌는지 사람에게 보여주는 데 쓴다.
 */
const ALLOWED_INPUT_KEYS: string[] = ['title', 'description', 'draft', 'slug', 'created', 'updated'];

interface Note {
	category: Category;
	slug: string;
	sourcePath: string;
	/** vault 파일명(확장자 제외). 위키링크 대상 해석에 쓴다. */
	basename: string;
	data: Record<string, unknown>;
	body: string;
}

function fail(message: string): never {
	console.error(`\n✗ ${message}\n`);
	process.exit(1);
}

/** 파일명을 URL에 쓸 slug로 바꾼다. 한글은 그대로 둔다 (Astro가 인코딩한다). */
function slugify(name: string): string {
	return name
		.trim()
		.toLowerCase()
		.replace(/\s+/g, '-')
		.replace(/[/\\?%*:|"<>#]/g, '')
		.replace(/-+/g, '-')
		.replace(/^-|-$/g, '');
}

function toDate(value: unknown): Date | undefined {
	if (value instanceof Date) return value;
	if (typeof value === 'string' || typeof value === 'number') {
		const d = new Date(value);
		if (!Number.isNaN(d.valueOf())) return d;
	}
	return undefined;
}

/** vault의 발행 폴더를 훑어 노트를 모은다. */
async function collect(): Promise<Note[]> {
	if (!existsSync(VAULT_BLOG_DIR)) {
		fail(
			`발행 폴더가 없습니다: ${VAULT_BLOG_DIR}\n` +
				`  vault 경로가 맞는지 확인하거나 VAULT_DIR 환경변수로 지정하세요.`,
		);
	}

	const entries = await readdir(VAULT_BLOG_DIR, { withFileTypes: true });
	const folders = entries.filter((e) => e.isDirectory()).map((e) => e.name);

	// 폴더가 카테고리를 정의하되, 블로그 앱이 모르는 카테고리는 거부한다.
	const unknown = folders.filter((f) => !(CATEGORY_KEYS as string[]).includes(f));
	if (unknown.length > 0) {
		fail(
			`blog/${unknown.join(', blog/')} 를 처리할 수 없습니다.\n` +
				`  '${unknown.join("', '")}'가 src/consts.ts의 CATEGORIES에 없습니다.\n` +
				`  등록된 카테고리: ${CATEGORY_KEYS.join(', ')}`,
		);
	}

	const notes: Note[] = [];
	for (const category of folders as Category[]) {
		const dir = path.join(VAULT_BLOG_DIR, category);
		for (const file of await readdir(dir)) {
			if (!file.endsWith('.md')) continue;

			const sourcePath = path.join(dir, file);
			const raw = await readFile(sourcePath, 'utf-8');
			const { data, content } = matter(raw);
			const basename = file.replace(/\.md$/, '');

			if (typeof data.title !== 'string' || !data.title.trim()) {
				fail(`title이 없습니다: ${sourcePath}`);
			}
			if (typeof data.description !== 'string' || !data.description.trim()) {
				fail(`description이 없습니다: ${sourcePath}`);
			}

			const slug = typeof data.slug === 'string' ? slugify(data.slug) : slugify(basename);
			if (!slug) fail(`slug을 만들 수 없습니다: ${sourcePath} (frontmatter에 slug을 지정하세요)`);

			notes.push({ category, slug, sourcePath, basename, data, body: content });
		}
	}
	return notes;
}

/**
 * [[위키링크]]를 변환한다.
 * 대상이 발행 대상이면 링크로, 아니면 대괄호를 벗겨 평문으로 만든다.
 */
function convertWikilinks(
	body: string,
	targets: Map<string, Note>,
): { body: string; stripped: string[] } {
	const stripped: string[] = [];
	const converted = body.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_m, rawTarget, label) => {
		const target = String(rawTarget).trim();
		const text = (label ?? target).toString().trim();
		const hit = targets.get(target);
		if (hit) return `[${text}](/${hit.category}/${hit.slug}/)`;
		stripped.push(target);
		return text;
	});
	return { body: converted, stripped };
}

/** 노트를 블로그 스키마의 frontmatter로 변환한다. 통과하는 키는 여기서 정한 것뿐이다. */
function buildFrontmatter(note: Note, fileCreated: Date): Record<string, unknown> {
	const pubDate = toDate(note.data.created) ?? fileCreated;
	const updatedDate = toDate(note.data.updated);

	const out: Record<string, unknown> = {
		title: String(note.data.title).trim(),
		description: String(note.data.description).trim(),
		pubDate: pubDate.toISOString().slice(0, 10),
		category: note.category,
	};
	if (updatedDate && updatedDate.valueOf() !== pubDate.valueOf()) {
		out.updatedDate = updatedDate.toISOString().slice(0, 10);
	}
	if (note.data.draft === true) out.draft = true;
	// 면책 문구는 사람이 적지 않는다. invest면 무조건 붙는다.
	if (note.category === 'invest') out.disclaimer = INVEST_DISCLAIMER;
	return out;
}

function serialize(frontmatter: Record<string, unknown>, body: string): string {
	const lines = Object.entries(frontmatter).map(([k, v]) =>
		typeof v === 'boolean' ? `${k}: ${v}` : `${k}: ${JSON.stringify(v)}`,
	);
	return `---\n${lines.join('\n')}\n---\n\n${body.trim()}\n`;
}

async function readManifest(): Promise<string[]> {
	if (!existsSync(MANIFEST)) return [];
	try {
		const parsed = JSON.parse(await readFile(MANIFEST, 'utf-8'));
		return Array.isArray(parsed.files) ? parsed.files : [];
	} catch {
		return [];
	}
}

async function main() {
	const notes = await collect();

	const bySlug = new Map<string, Note>();
	for (const note of notes) {
		const existing = bySlug.get(note.slug);
		if (existing) {
			fail(`slug이 겹칩니다 ('${note.slug}'):\n  ${existing.sourcePath}\n  ${note.sourcePath}`);
		}
		bySlug.set(note.slug, note);
	}

	// 위키링크 대상 해석용. 파일명과 title 양쪽으로 찾을 수 있게 한다.
	const targets = new Map<string, Note>();
	for (const note of notes) {
		targets.set(note.basename, note);
		targets.set(String(note.data.title).trim(), note);
	}

	await mkdir(OUT_DIR, { recursive: true });

	const written: string[] = [];
	const allStripped: Array<{ from: string; target: string }> = [];
	const droppedKeys = new Set<string>();

	for (const note of notes) {
		for (const key of Object.keys(note.data)) {
			if (!ALLOWED_INPUT_KEYS.includes(key)) droppedKeys.add(key);
		}

		const created = (await stat(note.sourcePath)).birthtime;
		const { body, stripped } = convertWikilinks(note.body, targets);
		for (const target of stripped) allStripped.push({ from: note.slug, target });

		const outPath = path.join(OUT_DIR, `${note.slug}.md`);
		const next = serialize(buildFrontmatter(note, created), body);
		const prev = existsSync(outPath) ? await readFile(outPath, 'utf-8') : null;
		if (prev !== next) await writeFile(outPath, next, 'utf-8');

		written.push(`${note.slug}.md`);
	}

	// 고아 정리 — 이전에 동기화했지만 이번엔 vault에 없는 글만 지운다.
	// 매니페스트에 없는 파일(손으로 쓴 글)은 건드리지 않는다.
	const previous = await readManifest();
	const removed = previous.filter((f) => !written.includes(f));
	for (const file of removed) {
		const p = path.join(OUT_DIR, file);
		if (existsSync(p)) await rm(p);
	}

	await writeFile(MANIFEST, `${JSON.stringify({ files: written.sort() }, null, 2)}\n`, 'utf-8');

	console.log(`\nvault: ${VAULT_BLOG_DIR}`);
	const byCategory = CATEGORY_KEYS.map((c) => {
		const n = notes.filter((x) => x.category === c).length;
		return `${CATEGORIES[c].label} ${n}편`;
	}).join(' · ');
	console.log(`동기화 ${written.length}편  (${byCategory})`);
	if (removed.length > 0) console.log(`삭제 ${removed.length}편: ${removed.join(', ')}`);

	if (droppedKeys.size > 0) {
		console.log(`\n버려진 frontmatter 키: ${[...droppedKeys].sort().join(', ')}`);
	}

	if (allStripped.length > 0) {
		console.log(`\n평문화된 위키링크 ${allStripped.length}건 (발행 대상이 아닌 노트):`);
		for (const { from, target } of allStripped) console.log(`  ${from}.md → [[${target}]]`);
	}

	console.log(`\n커밋 전에 'git diff'로 무엇이 들어왔는지 확인하세요.\n`);
}

main().catch((e) => fail(e instanceof Error ? e.message : String(e)));
