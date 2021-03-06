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

/// <reference path="../sceneComponent.ts" />

module pow2.scene.components {
  export class CameraComponent extends SceneComponent {
    process(view:SceneView) {
      view.camera.point.set(this.host.point);
      view.cameraScale = view.context.canvas.width > 768 ? 4 : 2;
      var canvasSize = view.screenToWorld(new Point(view.context.canvas.width, view.context.canvas.height), view.cameraScale);
      view.camera.extent.set(canvasSize);
    }
  }
}