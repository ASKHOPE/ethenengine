import { Hono } from 'hono';
import { WebsiteBuilder } from '../capabilities/website-builder/WebsiteBuilder.js';
import { ThemeEngine, THEME_PRESETS } from '../capabilities/theme-engine/ThemeEngine.js';
import { PersistenceDriver } from '../foundation/PersistenceDriver.js';

export const websiteRouter = new Hono<{ Variables: Record<string, any> }>();
export const themeRouter = new Hono<{ Variables: Record<string, any> }>();

const websiteBuilder = WebsiteBuilder.getInstance();
const themeEngine = ThemeEngine.getInstance();
const persistence = PersistenceDriver.getInstance();

// ============================================================
// Website Pages & Blocks Endpoints
// ============================================================
websiteRouter.get('/pages', (c) => {
  const tenant = c.get('tenant' as any) as any;
  return c.json({ pages: websiteBuilder.listPages(tenant.id) });
});

websiteRouter.post('/pages', async (c) => {
  const tenant = c.get('tenant' as any) as any;
  const body = await c.req.json();
  const { title, slug, blocks, isPublished } = body;
  const cleanSlug = (slug || `page-${Date.now()}`).replace(/^\/+/, '');

  const newPage = websiteBuilder.createPage({
    tenantId: tenant.id,
    title: title || 'New Page',
    slug: cleanSlug,
    blocks: blocks || [
      {
        id: `blk_${Date.now()}`,
        type: 'hero',
        settings: { title: title || 'New Page', subtitle: 'Created via ETHENENGINE Admin Builder', ctaText: 'Home', ctaUrl: '/' },
      },
    ],
    isPublished: isPublished ?? true,
    seo: { title: title || 'New Page', description: 'Enterprise page rendered via ETHENENGINE' },
  });

  await persistence.saveCollection('pages', websiteBuilder.listPages(tenant.id));
  return c.json({ page: newPage }, 201);
});

websiteRouter.get('/pages/:slug', (c) => {
  const tenant = c.get('tenant' as any) as any;
  const slug = c.req.param('slug');
  const page = websiteBuilder.getPageBySlug(tenant.id, slug);
  if (!page) return c.json({ error: 'Page not found' }, 404);
  return c.json({ page });
});

websiteRouter.put('/pages/:id', async (c) => {
  const tenant = c.get('tenant' as any) as any;
  const id = c.req.param('id');
  const body = await c.req.json();
  const { title, slug, isPublished, seoTitle, seoDescription, heroTitle, heroSubtitle, ctaText, ctaUrl } = body;
  
  try {
    const page = websiteBuilder.listPages(tenant.id).find(p => p.id === id || p.slug === id) || websiteBuilder.getPageBySlug(tenant.id, id);
    if (!page) return c.json({ error: 'Page not found' }, 404);

    const cleanSlug = slug ? slug.replace(/^\/+/, '') : page.slug;
    let blocks = page.blocks;
    if (heroTitle || heroSubtitle || ctaText || ctaUrl) {
      blocks = blocks.map(b => {
        if (b.type === 'hero') {
          return {
            ...b,
            settings: {
              ...b.settings,
              title: heroTitle || b.settings.title,
              subtitle: heroSubtitle || b.settings.subtitle,
              ctaText: ctaText || b.settings.ctaText,
              ctaUrl: ctaUrl || b.settings.ctaUrl,
            },
          };
        }
        return b;
      });
    }

    const updated = websiteBuilder.updatePage(page.id, {
      title: title || page.title,
      slug: cleanSlug,
      blocks,
      isPublished: isPublished !== undefined ? isPublished : page.isPublished,
      seo: {
        title: seoTitle || page.seo?.title || page.title,
        description: seoDescription || page.seo?.description || '',
      },
    });

    await persistence.saveCollection('pages', websiteBuilder.listPages(tenant.id));
    return c.json({ message: 'Page updated successfully', page: updated });
  } catch (err: any) {
    return c.json({ error: err.message || 'Failed to update page' }, 400);
  }
});

websiteRouter.put('/pages/:id/blocks', async (c) => {
  const tenant = c.get('tenant' as any) as any;
  const id = c.req.param('id');
  const body = await c.req.json();
  const page = websiteBuilder.listPages(tenant.id).find(p => p.id === id || p.slug === id) || websiteBuilder.getPageBySlug(tenant.id, id);
  if (!page) return c.json({ error: 'Page not found' }, 404);

  const updated = websiteBuilder.updatePageBlocks(page.id, body.blocks || []);
  await persistence.saveCollection('pages', websiteBuilder.listPages(tenant.id));
  return c.json({ page: updated });
});

// ============================================================
// Theme Engine Endpoints
// ============================================================
themeRouter.get('/presets', (c) => {
  return c.json({ presets: THEME_PRESETS });
});

themeRouter.post('/presets/:presetKey', async (c) => {
  const tenant = c.get('tenant' as any) as any;
  const presetKey = c.req.param('presetKey');
  const preset = THEME_PRESETS[presetKey];
  if (!preset) return c.json({ error: 'Preset not found' }, 404);
  const theme = themeEngine.getThemeForTenant(tenant.id);
  const updatedTheme = themeEngine.updateThemeTokens(theme.id, preset.tokens);
  return c.json({ theme: updatedTheme, message: `Applied ${preset.name} preset` });
});

themeRouter.get('/', (c) => {
  const tenant = c.get('tenant' as any) as any;
  const theme = themeEngine.getThemeForTenant(tenant.id);
  const cssVariables = themeEngine.generateCssVariables(theme.tokens);
  return c.json({ theme, cssVariables });
});

themeRouter.put('/', async (c) => {
  const tenant = c.get('tenant' as any) as any;
  const body = await c.req.json();
  const theme = themeEngine.getThemeForTenant(tenant.id);
  const updatedTheme = themeEngine.updateThemeTokens(theme.id, body.tokens);
  return c.json({ theme: updatedTheme });
});
