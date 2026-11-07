'use strict';

const { escapeHTML, stripHTML } = require('hexo-util');

const topics = ['java', 'algorithms', 'tools', 'opensource'];
const featured = [
  { slug: 'Kestra-PR-分享-224-如何修正-MySQL-serverId-的缺省策略', label: '开源贡献', title: '从一次评审，改好一个默认值', summary: 'Kestra PR #224：MySQL serverId 的实现、测试与评审。' },
  { slug: 'weconnected项目', label: '后端项目', title: 'weconnected 交友匹配系统', summary: '从校园社交需求出发，记录一个 Spring Boot 项目的设计。' },
  { slug: 'Java后端实习经历分享', label: '开发经历', title: '第一次走进实际开发', summary: '一个半月的后端实习，关于系统设计、协作和 AI 使用。' }
];
const arrow = '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const href = post => '/' + post.path;
const summary = post => escapeHTML(stripHTML((post.description || post.excerpt || post.content || '').replace(/<figure\b[^>]*>[\s\S]*?<\/figure>|<pre\b[^>]*>[\s\S]*?<\/pre>/gi, '')).replace(/\s+/g, ' ').trim().slice(0, 120));
const postRow = post => {
  const category = post.categories.toArray()[0]?.name || '学习记录';
  return `<article class="dyc-post"><div class="dyc-post-meta"><time datetime="${post.date.toISOString()}">${post.date.format('YYYY.MM.DD')}</time><span>${escapeHTML(category)}</span></div><h3><a href="${escapeHTML(href(post))}">${escapeHTML(post.title)}</a></h3><p>${summary(post)}</p><a class="dyc-read" href="${escapeHTML(href(post))}">阅读全文${arrow}</a></article>`;
};
const directory = (path, title, content, menu) => ({ path, layout: ['directory'], data: {
  title, layout: 'directory', content, description: hexo.config.description, navigation: { menu }
} });

hexo.extend.filter.register('before_generate', function () {
  if (hexo.config.theme !== 'stellar') return;
  hexo.theme.setView('directory.ejs', '<%- page.content %>');
  // 专题总览由下方生成，保留 Stellar 原生的文章系列导航。
  hexo.extend.generator.register('index_topic', () => []);
});

hexo.extend.generator.register('personal-home', function (locals) {
  if (hexo.config.theme !== 'stellar') return [];
  const posts = locals.posts.sort('date', -1).toArray();
  const featuredHtml = featured.map(item => {
    const post = posts.find(post => post.slug === item.slug);
    if (!post) throw new Error('首页精选文章不存在：' + item.slug);
    return `<a class="dyc-feature" href="${escapeHTML(href(post))}"><h3>${item.title}</h3><p>${item.summary}</p><span class="dyc-feature-footer">${item.label}${arrow}</span></a>`;
  }).join('');
  const topicHtml = topics.map(id => {
    const topic = locals.data['topic/' + id];
    const count = posts.filter(post => post.collection?.id === id).length;
    return `<a class="dyc-topic" href="/topic/${id}/"><span><strong>${escapeHTML(topic.name)}</strong><small>${escapeHTML(topic.description)}</small></span><span class="dyc-topic-count">${count} 篇${arrow}</span></a>`;
  }).join('');
  const latestHtml = posts.slice(0, 6).map(postRow).join('');
  const content = `<div class="dyc-home">
    <header class="dyc-intro"><div><h1>你好，我是<br><span>DarkYellowCat<span class="dyc-dot">.</span></span></h1><p>计科学生，记录 Java 后端学习、<br class="dyc-mobile-break">AI 工具与开源实践。</p><div class="dyc-intro-links"><a href="/about/">关于我${arrow}</a><a href="https://github.com/darkyellowcat" target="_blank" rel="noopener noreferrer">GitHub${arrow}</a></div></div><img src="/assets/brand/cat.svg" width="112" height="112" alt="DarkYellowCat 的琥珀色猫标识"></header>
    <section class="dyc-section" aria-labelledby="featured-title"><div class="dyc-section-head"><h2 id="featured-title">从这几篇开始</h2><span>项目、贡献与经历</span></div><div class="dyc-featured">${featuredHtml}</div></section>
    <section class="dyc-section" aria-labelledby="topics-title"><div class="dyc-section-head"><h2 id="topics-title">沿着专题读下去</h2><a href="/topic/">全部专题${arrow}</a></div><div class="dyc-topics">${topicHtml}</div></section>
    <section class="dyc-section" aria-labelledby="latest-title"><div class="dyc-section-head"><h2 id="latest-title">最近写的</h2><a href="/blog/">全部文章${arrow}</a></div><div class="dyc-latest">${latestHtml}</div></section>
  </div>`;
  const routes = [directory('index.html', '首页', content, 'home'),
    directory('topic/index.html', '专题笔记', `<div class="dyc-home"><header class="dyc-directory-head"><h1>专题笔记</h1><p>把零散的学习串起来，沿着一个方向继续读。</p></header><div class="dyc-topics">${topicHtml}</div></div>`, 'topic')];
  for (const id of topics) {
    const topic = locals.data['topic/' + id];
    const members = posts.filter(post => post.collection?.id === id);
    routes.push(directory(`topic/${id}/index.html`, topic.name, `<div class="dyc-home"><header class="dyc-directory-head"><a href="/topic/">全部专题</a><h1>${escapeHTML(topic.name)}</h1><p>${escapeHTML(topic.description)}</p><span>${members.length} 篇文章 · 按时间倒序</span></header><div class="dyc-latest">${members.map(postRow).join('')}</div></div>`, 'topic'));
  }
  // 保留旧首页分页的收藏地址，文章永久链接不变。
  for (let page = 2; page <= Math.ceil(posts.length / 10); page++) {
    const target = `/blog/page/${page}/`;
    routes.push({ path: `page/${page}/index.html`, data: `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=${target}"><link rel="canonical" href="${hexo.config.url}${target}"><title>文章列表</title></head><body><a href="${target}">前往文章列表</a></body></html>` });
  }
  return routes;
});
