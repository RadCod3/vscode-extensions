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

import React, { useMemo, useState } from "react";
import {
    Button,
    SidePanel,
    SidePanelTitleContainer,
    SidePanelBody,
    Codicon
} from "@wso2/ui-toolkit";
import { useVisualizerContext } from '@wso2/mi-rpc-client';

import { useDMIOConfigPanelStore } from "../../../../store/store";
import { ImportDataButtons } from "./ImportDataButtons";
import { ImportDataPanel } from "./ImportDataPanel";
import { useShallow } from 'zustand/react/shallow';

export interface ImportType {
    type: string;
    label: string;
}

export enum FileExtension {
    JSON = ".json",
    XML = ".xml",
    CSV = ".csv",
    XSD = ".xsd"
}

export type ImportDataWizardProps = {
    configName: string;
    documentUri: string;
};

export function ImportDataForm(props: ImportDataWizardProps) {
    const { configName, documentUri } = props;
    const { rpcClient } = useVisualizerContext();

    const [selectedImportType, setSelectedImportType] = useState<ImportType>(undefined);

    const { isOpen, ioType, overwriteSchema, setSidePanelOpen } = useDMIOConfigPanelStore(
    useShallow(state => ({
        isOpen: state.isIOConfigPanelOpen,
        ioType: state.ioConfigPanelType,
        overwriteSchema: state.isSchemaOverridden,
        setSidePanelOpen: state.setIsIOConfigPanelOpen
    }))
);

    const fileExtension = useMemo(() => {
        if (!selectedImportType) return undefined;

        switch (selectedImportType.type) {
            case 'JSON':
                return FileExtension.JSON;
            case 'CSV':
                return FileExtension.CSV;
            case 'XML':
                return FileExtension.XML;
            case 'JSONSCHEMA':
                return FileExtension.JSON;
            case 'XSD':
                return FileExtension.XSD;
        }
    }, [selectedImportType]);


    const loadSchema = async (content: string, csvDelimiter?: string) => {
        const request = {
            documentUri: documentUri,
            overwriteSchema: overwriteSchema,
            content: content,
            ioType: ioType,
            schemaType: selectedImportType.type.toLowerCase(),
            configName: configName,
            csvDelimiter
        }
        await rpcClient.getMiDataMapperRpcClient().browseSchema(request).then(response => {
            setSidePanelOpen(false);
            if (!response.success) {
                console.error("Error while importing schema");
            }
        }).catch(e => {
            console.error("Error while importing schema", e);
        });
    };

    const handleFileUpload = (text: string, csvDelimiter?: string) => {
        loadSchema(text, csvDelimiter);
    };

    const onClose = () => {
        setSelectedImportType(undefined);
        setSidePanelOpen(false);
    };

    const handleImportTypeChange = (importType: ImportType) => {
        setSelectedImportType(importType);
    };

    return (
        <SidePanel
            isOpen={isOpen}
            alignment="right"
            width={312}
            overlay={false}
        >
            <SidePanelTitleContainer>
                {selectedImportType && (
                    <Codicon name="arrow-left"
                        sx={{ width: "20px"}}
                        onClick={() => setSelectedImportType(undefined)}
                    />
                )}
                <span>{`${overwriteSchema ? "Change" : "Import"} ${ioType} schema`}</span>
                <Button
                    sx={{ marginLeft: "auto" }}
                    onClick={onClose}
                    appearance="icon"
                >
                    <Codicon name="close" />
                </Button>
            </SidePanelTitleContainer>
            <SidePanelBody  data-testid="import-data-form">
                {!selectedImportType && <ImportDataButtons onImportTypeChange={handleImportTypeChange} />}
                {selectedImportType && (
                    <ImportDataPanel
                        importType={selectedImportType}
                        extension={fileExtension}
                        rowRange={{ start: 15, offset: 10 }}
                        onSave={handleFileUpload}
                        data-testid="import-data-panel"
                    />
                )}
            </SidePanelBody>
        </SidePanel>
    );
}
