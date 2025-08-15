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

import { Page, expect, Frame } from '@playwright/test';
import { switchToIFrame } from '@wso2/playwright-vscode-tester';

export interface MigrationConfig {
    tool: 'mule' | 'tibco' | 'other';
    sourcePath: string;
    projectName: string;
    packageName: string;
    template: string;
}

export class ImportIntegrationHelper {
    private page: Page;
    private webview: Frame | null = null;

    constructor(page: Page) {
        this.page = page;
    }

    async openImportIntegrationWizard(): Promise<void> {
        // Navigate to Import Integration from the command palette or menu
        await this.page.keyboard.press('Control+Shift+P');
        await this.page.getByText('Import Integration').click();
        
        // Switch to the webview
        this.webview = await switchToIFrame('WSO2 Integrator: BI', this.page);
        if (!this.webview) {
            throw new Error('Import Integration webview not found');
        }
    }

    async fillImportForm(config: MigrationConfig): Promise<void> {
        if (!this.webview) {
            throw new Error('Webview not initialized. Call openImportIntegrationWizard() first.');
        }

        // Step 1: Select migration tool and source
        await this.selectMigrationTool(config.tool);
        await this.setSourcePath(config.sourcePath);
        await this.clickNext();

        // Step 2: Configure project
        await this.fillProjectConfiguration(config);
    }

    async selectMigrationTool(tool: string): Promise<void> {
        if (!this.webview) throw new Error('Webview not initialized');

        const toolSelector = this.webview.locator('[data-testid="migration-tool-selector"]');
        await toolSelector.waitFor();
        await toolSelector.click();
        
        // Select the tool from dropdown
        await this.webview.getByText(tool, { exact: false }).click();
    }

    async setSourcePath(path: string): Promise<void> {
        if (!this.webview) throw new Error('Webview not initialized');

        const sourceInput = this.webview.locator('[data-testid="source-folder-input"]');
        await sourceInput.waitFor();
        await sourceInput.fill(path);
    }

    async clickNext(): Promise<void> {
        if (!this.webview) throw new Error('Webview not initialized');

        const nextButton = this.webview.locator('[data-testid="next-button"]');
        await expect(nextButton).toBeEnabled();
        await nextButton.click();
    }

    async fillProjectConfiguration(config: MigrationConfig): Promise<void> {
        if (!this.webview) throw new Error('Webview not initialized');

        // Wait for project configuration form
        await this.webview.locator('[data-testid="configure-project-form"]').waitFor();

        // Fill project name
        const projectNameInput = this.webview.locator('[data-testid="project-name-input"]');
        await projectNameInput.fill(config.projectName);

        // Fill package name
        const packageInput = this.webview.locator('[data-testid="package-input"]');
        await packageInput.fill(config.packageName);

        // Select template
        const templateSelect = this.webview.locator('[data-testid="template-select"]');
        await templateSelect.click();
        await this.webview.getByText(config.template).click();
    }

    async startMigration(): Promise<void> {
        if (!this.webview) throw new Error('Webview not initialized');

        const startButton = this.webview.locator('[data-testid="start-migration-button"]');
        await expect(startButton).toBeEnabled();
        await startButton.click();

        // Wait for migration progress view
        await this.webview.locator('[data-testid="migration-progress-view"]').waitFor();
    }

    async waitForMigrationCompletion(timeoutMs: number = 60000): Promise<void> {
        if (!this.webview) throw new Error('Webview not initialized');

        // Wait for completion header
        await this.webview.locator('h2:has-text("Migration Completed Successfully")').waitFor({ 
            timeout: timeoutMs 
        });
    }

    async verifyCoverageSummary(): Promise<void> {
        if (!this.webview) throw new Error('Webview not initialized');

        // Verify coverage elements are present
        await expect(this.webview.locator('[data-testid="coverage-summary"]')).toBeVisible();
        await expect(this.webview.locator('[data-testid="coverage-percentage"]')).toBeVisible();
        await expect(this.webview.locator('[data-testid="coverage-progress-bar"]')).toBeVisible();
        await expect(this.webview.locator('[data-testid="coverage-badge"]')).toBeVisible();
    }

    async verifyLogsAutoOpen(): Promise<void> {
        if (!this.webview) throw new Error('Webview not initialized');

        // During migration, logs should be automatically visible
        await expect(this.webview.locator('[data-testid="migration-logs-container"]')).toBeVisible();
    }

    async verifyLogsAutoCollapse(): Promise<void> {
        if (!this.webview) throw new Error('Webview not initialized');

        // After migration, logs should be collapsed by default
        await expect(this.webview.locator('[data-testid="migration-logs-toggle"]')).toBeVisible();
        await expect(this.webview.locator('[data-testid="migration-logs-container"]')).not.toBeVisible();
    }

    async expandMigrationReport(): Promise<void> {
        if (!this.webview) throw new Error('Webview not initialized');

        const reportToggle = this.webview.locator('[data-testid="migration-report-toggle"]');
        await reportToggle.click();
    }

    async verifyReportSections(): Promise<void> {
        if (!this.webview) throw new Error('Webview not initialized');

        // Verify key report sections
        await expect(this.webview.locator('h2:has-text("Manual Work Estimation")')).toBeVisible();
        await expect(this.webview.locator('strong:has-text("Estimation Scenarios")')).toBeVisible();
        await expect(this.webview.locator('h2:has-text("Currently Unsupported")')).toBeVisible();

        // Verify estimation table structure
        await expect(this.webview.locator('table')).toBeVisible();
        await expect(this.webview.locator('th:has-text("Scenario")')).toBeVisible();
        await expect(this.webview.locator('th:has-text("Working Days")')).toBeVisible();
        await expect(this.webview.locator('th:has-text("Weeks")')).toBeVisible();
    }

    async proceedToFinalStep(): Promise<void> {
        if (!this.webview) throw new Error('Webview not initialized');

        const proceedButton = this.webview.locator('[data-testid="proceed-button"]');
        await expect(proceedButton).toBeEnabled();
        await expect(proceedButton).toHaveText('Proceed to Final Step');
        await proceedButton.click();
    }

    async verifyErrorHandling(expectedErrorMessage: string): Promise<void> {
        if (!this.webview) throw new Error('Webview not initialized');

        const errorMessage = this.webview.locator('[data-testid="error-message"]');
        await expect(errorMessage).toBeVisible();
        await expect(errorMessage).toContainText(expectedErrorMessage);
    }

    async getWebview(): Promise<Frame> {
        if (!this.webview) {
            throw new Error('Webview not initialized. Call openImportIntegrationWizard() first.');
        }
        return this.webview;
    }
}