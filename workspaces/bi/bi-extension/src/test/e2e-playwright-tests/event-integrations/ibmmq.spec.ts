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

import { test } from '@playwright/test';
import { addArtifact, initTest, page } from '../utils';
import { Form, switchToIFrame } from '@wso2/playwright-vscode-tester';
import { ProjectExplorer } from '../ProjectExplorer';

export default function createTests() {
    test.describe('IBM MQ Integration Tests', {
        tag: '@group1',
    }, async () => {
        let listenerName: string;
        initTest();
        test('Create IBM MQ Integration', async ({ }, testInfo) => {
            const testAttempt = testInfo.retry + 1;
            console.log('Creating a new service in test attempt: ', testAttempt);
            // Creating a IBM MQ Integration
            await addArtifact('IBM MQ Integration', 'trigger-ibm-ibmmq');
            const artifactWebView = await switchToIFrame('WSO2 Integrator: BI', page.page);
            if (!artifactWebView) {
                throw new Error('WSO2 Integrator: BI webview not found');
            }
            // Create a new listener
            listenerName = `ibmListener${testAttempt}`;
            const queueManagerName = `"QM1"`;
            const host = `"localhost:1414"`;
            const channel = `"testChannel"`;
            const form = new Form(page.page, 'WSO2 Integrator: BI', artifactWebView);
            await form.switchToFormView(false, artifactWebView);
            await form.fill({
                values: {
                    'Name*The name of the listener': {
                        type: 'input',
                        value: listenerName,
                    },
                    'name': {
                        type: 'textarea',
                        value: queueManagerName,
                    },
                    'host': {
                        type: 'textarea',
                        value: host,
                    },
                    'channel': {
                        type: 'textarea',
                        value: channel,
                    }
                }
            });
            await form.submit('Next');

            // Check for title
            const configTitle = artifactWebView.locator('h3', { hasText: 'IBM MQ Event Handler Configuration' });
            await configTitle.waitFor();

            const selectedListener = artifactWebView.locator(`[current-value="${listenerName}"]`);
            await selectedListener.waitFor();

            await form.submit('Create');

            const onMessage = artifactWebView.locator(`text="onMessage"`);
            await onMessage.waitFor();

            const onError = artifactWebView.locator(`text="onError"`);
            await onError.waitFor();

            const projectExplorer = new ProjectExplorer(page.page);
            await projectExplorer.findItem(['sample', `IBM MQ Event Handler`], true);

            const updateArtifactWebView = await switchToIFrame('WSO2 Integrator: BI', page.page);
            if (!updateArtifactWebView) {
                throw new Error('WSO2 Integrator: BI webview not found');
            }
        });

        test('Editing IBM MQ Service', async ({ }, testInfo) => {
            const testAttempt = testInfo.retry + 1;
            console.log('Editing a service in test attempt: ', testAttempt);
            const artifactWebView = await switchToIFrame('WSO2 Integrator: BI', page.page);
            if (!artifactWebView) {
                throw new Error('WSO2 Integrator: BI webview not found');
            }

            const editBtn = artifactWebView.locator('vscode-button[title="Edit Service"]');
            await editBtn.waitFor();
            await editBtn.click({ force: true });

            const form = new Form(page.page, 'WSO2 Integrator: BI', artifactWebView);
            await form.switchToFormView(false, artifactWebView);

            const configTitle = artifactWebView.locator('h3', { hasText: 'IBM MQ Event Handler Configuration' });
            await configTitle.waitFor();

            const selectedListener = artifactWebView.locator(`[current-value="${listenerName}"]`);
            await selectedListener.waitFor();

            await form.submit('Save');

            const onMessage = artifactWebView.locator(`text="onMessage"`);
            await onMessage.waitFor();

            const onError = artifactWebView.locator(`text="onError"`);
            await onError.waitFor();
        });
    });
}
