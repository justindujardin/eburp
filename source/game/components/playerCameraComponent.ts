/*
 Copyright (C) 2013-2015 by Justin DuJardin and Contributors

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

/// <reference path="../../tile/tileObject.ts" />
/// <reference path="./playerComponent.ts" />

module pow2.game.components {
  export class PlayerCameraComponent extends pow2.scene.components.CameraComponent {
    host:pow2.tile.TileObject;

    process(view:pow2.scene.SceneView) {
      super.process(view);
      // Center on player object
      view.camera.setCenter(this.host.renderPoint || this.host.point);

      // Clamp to tile map if it is present.
      if (this.host.tileMap) {
        view.camera.point.x = Math.min(view.camera.point.x, this.host.tileMap.bounds.extent.x - view.camera.extent.x);
        view.camera.point.y = Math.min(view.camera.point.y, this.host.tileMap.bounds.extent.y - view.camera.extent.y);
        view.camera.point.x = Math.max(0, view.camera.point.x);
        view.camera.point.y = Math.max(0, view.camera.point.y);

        // Center in viewport if tilemap is smaller than camera.
        if (this.host.tileMap.bounds.extent.x < view.camera.extent.x) {
          view.camera.point.x = (this.host.tileMap.bounds.extent.x - view.camera.extent.x) / 2;
        }
        if (this.host.tileMap.bounds.extent.y < view.camera.extent.y) {
          view.camera.point.y = (this.host.tileMap.bounds.extent.y - view.camera.extent.y) / 2;
        }
      }
    }
  }
}