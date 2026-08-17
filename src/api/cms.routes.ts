import { Hono } from 'hono';
import { BasicCMS } from '../capabilities/basic-cms/BasicCMS.js';

export const cmsRouter = new Hono();
const cms = BasicCMS.getInstance();

cmsRouter.get('/content-types', (c) => {
  const tenant = c.get('tenant' as any) as any;
  return c.json({ contentTypes: cms.listContentTypes(tenant.id) });
});

cmsRouter.post('/content-types', async (c) => {
  const tenant = c.get('tenant' as any) as any;
  const body = await c.req.json();
  const { name, slug, fields } = body;
  const contentType = cms.createContentType({ tenantId: tenant.id, name, slug, fields });
  return c.json({ contentType }, 201);
});

cmsRouter.get('/entries', (c) => {
  const tenant = c.get('tenant' as any) as any;
  const contentTypeId = c.req.query('contentTypeId');
  return c.json({ entries: cms.listEntries(tenant.id, contentTypeId) });
});

cmsRouter.post('/entries', async (c) => {
  const tenant = c.get('tenant' as any) as any;
  const body = await c.req.json();
  const { contentTypeId, slug, data, status } = body;
  const entry = cms.createEntry({ tenantId: tenant.id, contentTypeId, slug, data, status: status || 'published' });
  return c.json({ entry }, 201);
});
