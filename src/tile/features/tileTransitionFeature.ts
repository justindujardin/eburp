/**
 Copyright (C) 2013 by Justin DuJardin

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

/// <reference path="../../core/point.ts" />
/// <reference path="../objects/tileFeatureObject.ts" />

module eburp {
    export class TileTransitionFeature extends TileFeatureObject {
        target:string;
        targetX: number;
        targetY: number;
        enter(object):boolean {
            if(!this.target || !this.tileMap){
                return false;
            }
            console.log("Transition to: " + this.target);
            object.point.set(this.targetX,this.targetY);
            this.tileMap.setMap(this.target);
            return true;
        }
    }
}