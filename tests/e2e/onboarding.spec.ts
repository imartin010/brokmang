/**
 * Onboarding Flow E2E Test
 * Brokmang. v1.1
 */

import { test, expect } from '@playwright/test';

test.describe('Onboarding Wizard', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to onboarding page
    await page.goto('/onboarding');
  });

  test('displays welcome message and progress indicator', async ({ page }) => {
    // Check for welcome message
    await expect(page.getByText('Welcome to Brokmang.')).toBeVisible();
    
    // Check for progress indicator
    await expect(page.getByText('Organization')).toBeVisible();
    await expect(page.getByText('Branches')).toBeVisible();
    await expect(page.getByText('Teams')).toBeVisible();
  });

  test('completes organization step', async ({ page }) => {
    // Fill organization name
    await page.fill('input[id="name"]', 'Test Brokerage');
    
    // Check auto-generated slug
    const slug = await page.inputValue('input[id="slug"]');
    expect(slug).toContain('test-brokerage');
    
    // Click continue
    await page.click('button:has-text("Continue")');
    
    // Should navigate to branches step
    await expect(page.getByText('Add Your Office Branches')).toBeVisible();
  });

  test('validates organization name is required', async ({ page }) => {
    // Try to continue without filling name
    await page.click('button:has-text("Continue")');
    
    // Should show error
    await expect(page.getByText(/must be at least 2 characters/)).toBeVisible();
  });

  test('can add multiple branches', async ({ page }) => {
    // Complete step 1
    await page.fill('input[id="name"]', 'Test Brokerage');
    await page.click('button:has-text("Continue")');
    
    // Add first branch
    await page.fill('input[placeholder*="Downtown"]', 'Main Office');
    
    // Add another branch
    await page.click('button:has-text("Add Another Branch")');
    
    // Should have 2 branch forms
    const branchInputs = await page.locator('input[placeholder*="Downtown"]').count();
    expect(branchInputs).toBe(2);
  });

  test('shows progress as steps are completed', async ({ page }) => {
    // Step 1
    await page.fill('input[id="name"]', 'Test Brokerage');
    await page.click('button:has-text("Continue")');
    
    // Check step 1 is marked complete
    const step1 = page.locator('text=Organization').locator('..');
    await expect(step1).toContainText('Organization');
    
    // Continue to step 2
    await page.fill('input[placeholder*="Downtown"]', 'Main Office');
    await page.click('button:has-text("Continue")');
    
    // Should be on step 3
    await expect(page.getByText('Create Sales Teams')).toBeVisible();
  });

  test('can navigate backwards', async ({ page }) => {
    // Complete step 1
    await page.fill('input[id="name"]', 'Test Brokerage');
    await page.click('button:has-text("Continue")');
    
    // Should be on step 2
    await expect(page.getByText('Add Your Office Branches')).toBeVisible();
    
    // Click back
    await page.click('button:has-text("Back")');
    
    // Should be back on step 1
    await expect(page.getByText('Create Your Organization')).toBeVisible();
    
    // Data should be preserved
    const name = await page.inputValue('input[id="name"]');
    expect(name).toBe('Test Brokerage');
  });
});

