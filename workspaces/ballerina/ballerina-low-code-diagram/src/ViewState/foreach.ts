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
import { BlockViewState } from "./block";
import { SimpleBBox } from "./simple-bbox";
import { StatementViewState } from "./statement";

export class ForEachViewState extends StatementViewState {
    public foreachLifeLine: SimpleBBox = new SimpleBBox();
    public foreachHead: SimpleBBox = new SimpleBBox();
    public foreachBody: BlockViewState = new BlockViewState();
    public foreachBodyRect: SimpleBBox = new SimpleBBox();

    constructor() {
        super();
    }
}
