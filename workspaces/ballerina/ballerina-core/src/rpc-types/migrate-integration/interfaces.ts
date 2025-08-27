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

export interface MigrationTool {
    id: number;
    title: string;
    needToPull: boolean;
    commandName: string;
    description: string;
    requiredVersion: string;
    parameters: Array<{
        key: string;
        label: string;
        type: "boolean" | "string" | "number";
        defaultValue?: boolean | string | number;
    }>;
}

export interface GetMigrationToolsResponse {
    tools: MigrationTool[];
}

export interface MigrationToolPullRequest {
    toolName: string;
}

export interface ImportIntegrationRPCRequest {
    commandName: string;
    packageName: string;
    sourcePath: string;
    [key: string]: any;
}

export interface OpenMigrationReportRequest {
    reportContent: string;
    fileName: string;
}

export interface SaveMigrationReportRequest {
    reportContent: string;
    defaultFileName: string;
}
