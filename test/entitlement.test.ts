import { FeatureEntitlementEngine } from '../src/core/FeatureEntitlementEngine.js';
import { HierarchyManager } from '../src/core/HierarchyManager.js';

async function runEntitlementTestSuite() {
  console.log('================================================================');
  console.log(' Running Subscription Feature Entitlement Test Suite (Pro/Ent)  ');
  console.log('================================================================');

  const entitlementEngine = FeatureEntitlementEngine.getInstance();
  const hierarchyManager = HierarchyManager.getInstance();

  // Test 1: Create Organization Tiers (Pro vs Enterprise)
  console.log('\n--- Test 1: Setting up Pro & Enterprise Tiers ---');
  const proOrg = hierarchyManager.createOrganization('Pro Agency', 'billing@proagency.com', 'pro');
  proOrg.id = 'org_pro_tier_' + Date.now();
  (hierarchyManager as any).orgs.set(proOrg.id, proOrg);
  const proTenant = hierarchyManager.createTenant(proOrg.id, 'Pro Agency Platform', 'pro-tenant', 'pro.localhost');

  console.log('✓ Created Pro Tenant ->', proTenant.id, '(Org Plan: pro)');

  // Test 2: Pro Tier Entitlements
  console.log('\n--- Test 2: Verifying Pro Tier Entitlements ---');
  if (!entitlementEngine.isFeatureAllowed(proTenant.id, 'website_builder')) throw new Error('Pro tier blocked website_builder!');
  if (!entitlementEngine.isFeatureAllowed(proTenant.id, 'basic_cms')) throw new Error('Pro tier blocked basic_cms!');
  if (!entitlementEngine.isFeatureAllowed(proTenant.id, 'commerce')) throw new Error('Pro tier blocked commerce!');
  if (!entitlementEngine.isFeatureAllowed(proTenant.id, 'crm')) throw new Error('Pro tier blocked crm!');
  if (entitlementEngine.isFeatureAllowed(proTenant.id, 'erp')) throw new Error('Pro tier allowed erp!');
  if (entitlementEngine.isFeatureAllowed(proTenant.id, 'accounting')) throw new Error('Pro tier allowed accounting!');
  console.log('✓ Pro tier allows Website Builder, Basic CMS, Commerce & CRM, while blocking ERP & Accounting.');

  // Test 3: Enterprise Tier Entitlements
  console.log('\n--- Test 3: Verifying Enterprise Tier Entitlements ---');
  const enterpriseTenantId = 'tenant_default'; // Uses org_acme (enterprise)
  if (!entitlementEngine.isFeatureAllowed(enterpriseTenantId, 'erp')) throw new Error('Enterprise tier blocked erp!');
  if (!entitlementEngine.isFeatureAllowed(enterpriseTenantId, 'accounting')) throw new Error('Enterprise tier blocked accounting!');
  if (!entitlementEngine.isFeatureAllowed(enterpriseTenantId, 'automation_workflows')) throw new Error('Enterprise tier blocked automation_workflows!');
  if (!entitlementEngine.isFeatureAllowed(enterpriseTenantId, 'enterprise_sso')) throw new Error('Enterprise tier blocked enterprise_sso!');
  console.log('✓ Enterprise tier has 100% full access to all features (ERP, Accounting, Workflows, SSO).');

  console.log('\n================================================================');
  console.log(' ALL PRO & ENTERPRISE ENTITLEMENT TESTS PASSED SUCCESSFULLY!    ');
  console.log('================================================================');
}

runEntitlementTestSuite().catch((err) => {
  console.error('Entitlement Test Suite Failed:', err);
  process.exit(1);
});
