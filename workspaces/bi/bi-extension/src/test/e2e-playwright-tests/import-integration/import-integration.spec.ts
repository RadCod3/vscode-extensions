/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com) All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { test, expect } from '@playwright/test';
import { initTest, page } from '../utils';
import { switchToIFrame } from '@wso2/playwright-vscode-tester';
import { ImportIntegrationHelper } from './ImportIntegrationUtils';

export default function createTests() {
    test.describe('Import Integration Tests', {
        tag: '@group1',
    }, async () => {
        initTest();

        test('Open Import Integration Wizard', async ({ }, testInfo) => {
            const testAttempt = testInfo.retry + 1;
            console.log('Opening Import Integration wizard in test attempt: ', testAttempt);

            const helper = new ImportIntegrationHelper(page.page);
            await helper.openImportIntegrationWizard();

            const importWebView = await helper.getWebview();
            
            // Verify the first step form elements are visible
            await expect(importWebView.locator('[data-testid="migration-tool-selector"]')).toBeVisible();
            await expect(importWebView.locator('[data-testid="source-folder-input"]')).toBeVisible();
            await expect(importWebView.locator('[data-testid="next-button"]')).toBeVisible();
        });

        test('Select Migration Tool and Source Folder', async ({ }, testInfo) => {
            const testAttempt = testInfo.retry + 1;
            console.log('Testing migration tool selection in test attempt: ', testAttempt);

            const importWebView = await switchToIFrame('WSO2 Integrator: BI', page.page);
            if (!importWebView) {
                throw new Error('Import Integration webview not found');
            }

            // Select a migration tool (e.g., "mule")
            const migrationToolSelect = importWebView.locator('[data-testid="migration-tool-selector"]');
            await migrationToolSelect.click();
            await importWebView.getByText('Mule').click();

            // Enter source folder path
            const sourceFolderInput = importWebView.locator('[data-testid="source-folder-input"]');
            await sourceFolderInput.fill('/path/to/source/project');

            // Click Next button
            const nextButton = importWebView.locator('[data-testid="next-button"]');
            await expect(nextButton).toBeEnabled();
            await nextButton.click();

            // Verify we moved to the next step (project configuration)
            await expect(importWebView.locator('[data-testid="configure-project-form"]')).toBeVisible();
            await expect(importWebView.locator('[data-testid="project-name-input"]')).toBeVisible();
        });

        test('Configure Project Details', async ({ }, testInfo) => {
            const testAttempt = testInfo.retry + 1;
            console.log('Testing project configuration in test attempt: ', testAttempt);

            const importWebView = await switchToIFrame('WSO2 Integrator: BI', page.page);
            if (!importWebView) {
                throw new Error('Import Integration webview not found');
            }

            // Fill project configuration form manually
            const projectNameInput = importWebView.locator('[data-testid="project-name-input"]');
            await projectNameInput.fill(`MigratedProject${testAttempt}`);

            const packageInput = importWebView.locator('[data-testid="package-input"]');
            await packageInput.fill('com.example.integration');

            const templateSelect = importWebView.locator('[data-testid="template-select"]');
            await templateSelect.click();
            await importWebView.getByText('Main').click();

            // Click Start Migration button
            const startMigrationButton = importWebView.locator('[data-testid="start-migration-button"]');
            await expect(startMigrationButton).toBeEnabled();
            await startMigrationButton.click();

            // Verify we moved to migration progress view
            await expect(importWebView.locator('[data-testid="migration-progress-view"]')).toBeVisible();
        });

        test('Monitor Migration Progress', async ({ }, testInfo) => {
            const testAttempt = testInfo.retry + 1;
            console.log('Testing migration progress monitoring in test attempt: ', testAttempt);

            const importWebView = await switchToIFrame('WSO2 Integrator: BI', page.page);
            if (!importWebView) {
                throw new Error('Import Integration webview not found');
            }

            // Verify migration progress elements are visible
            await expect(importWebView.locator('h2').filter({ hasText: 'Migration in Progress' })).toBeVisible();
            
            // Verify logs are automatically visible during migration
            await expect(importWebView.locator('[data-testid="migration-logs-container"]')).toBeVisible();
            
            // Wait for migration to complete (or timeout after reasonable time)
            await importWebView.waitForSelector('h2:has-text("Migration Completed Successfully")', { 
                timeout: 60000 
            });

            // Verify coverage summary is displayed
            await expect(importWebView.locator('[data-testid="coverage-summary"]')).toBeVisible();
            await expect(importWebView.locator('[data-testid="coverage-percentage"]')).toBeVisible();
            await expect(importWebView.locator('[data-testid="coverage-progress-bar"]')).toBeVisible();

            // Verify proceed button is enabled and positioned correctly
            const proceedButton = importWebView.locator('[data-testid="proceed-button"]');
            await expect(proceedButton).toBeEnabled();
            await expect(proceedButton).toHaveText('Proceed to Final Step');
        });

        test('View Migration Report', async ({ }, testInfo) => {
            const testAttempt = testInfo.retry + 1;
            console.log('Testing migration report viewing in test attempt: ', testAttempt);

            const importWebView = await switchToIFrame('WSO2 Integrator: BI', page.page);
            if (!importWebView) {
                throw new Error('Import Integration webview not found');
            }

            // Click to expand migration report
            const reportToggle = importWebView.locator('[data-testid="migration-report-toggle"]');
            await reportToggle.click();

            // Verify report sections are visible
            await expect(importWebView.locator('h2:has-text("Manual Work Estimation")')).toBeVisible();
            await expect(importWebView.locator('h2:has-text("Estimation Scenarios")')).toBeVisible();
            await expect(importWebView.locator('h2:has-text("Currently Unsupported")')).toBeVisible();

            // Verify estimation table is rendered
            await expect(importWebView.locator('table')).toBeVisible();
            await expect(importWebView.locator('th:has-text("Scenario")')).toBeVisible();
            await expect(importWebView.locator('th:has-text("Working Days")')).toBeVisible();

            // Test logs toggle functionality
            const logsToggle = importWebView.locator('[data-testid="migration-logs-toggle"]');
            await logsToggle.click();
            await expect(importWebView.locator('[data-testid="migration-logs-container"]')).toBeVisible();
        });

        test('Complete Migration Workflow', async ({ }, testInfo) => {
            const testAttempt = testInfo.retry + 1;
            console.log('Testing complete migration workflow in test attempt: ', testAttempt);

            const importWebView = await switchToIFrame('WSO2 Integrator: BI', page.page);
            if (!importWebView) {
                throw new Error('Import Integration webview not found');
            }

            // Click proceed to final step
            const proceedButton = importWebView.locator('[data-testid="proceed-button"]');
            await proceedButton.click();

            // Verify we reach the final step or project is created
            // This will depend on your actual final step implementation
            await expect(importWebView.locator('h2:has-text("Migration Complete")')).toBeVisible({ timeout: 30000 });

            console.log(`Migration workflow completed successfully in test attempt: ${testAttempt}`);
        });

        test('Handle Migration Errors', async ({ }, testInfo) => {
            const testAttempt = testInfo.retry + 1;
            console.log('Testing migration error handling in test attempt: ', testAttempt);

            const importWebView = await switchToIFrame('WSO2 Integrator: BI', page.page);
            if (!importWebView) {
                throw new Error('Import Integration webview not found');
            }

            // Test with invalid source folder
            const sourceFolderInput = importWebView.locator('[data-testid="source-folder-input"]');
            await sourceFolderInput.fill('/invalid/path');

            const nextButton = importWebView.locator('[data-testid="next-button"]');
            await nextButton.click();

            // Verify error message is displayed
            await expect(importWebView.locator('[data-testid="error-message"]')).toBeVisible();
            await expect(importWebView.locator('[data-testid="error-message"]')).toContainText('Invalid source folder');
        });
    });
}