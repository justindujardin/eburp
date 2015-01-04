/*
 Copyright (C) 2013-2014 by Justin DuJardin and Contributors

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

/// <reference path="../services/dorkaponService.ts"/>

module dorkapon.directives {
   app.directive('dorkaponMapCanvas', [
      '$compile',
      '$dorkapon',
      function ($compile, dorkapon:dorkapon.services.DorkaponGameService) {
         return {
            restrict: 'A',
            link: function ($scope, element, attrs) {
               $scope.canvas = element[0];
               var context = $scope.canvas.getContext("2d");
               context.webkitImageSmoothingEnabled = false;
               context.mozImageSmoothingEnabled = false;
               window.addEventListener('resize',onResize,false);
               var $window = $(window);
               function onResize(){
                  context.canvas.width = $window.width();
                  context.canvas.height = $window.height();
                  context.webkitImageSmoothingEnabled = false;
                  context.mozImageSmoothingEnabled = false;
               }
               var tileView:pow2.GameMapView = new pow2.GameMapView(element[0], dorkapon.loader);
               tileView.camera.extent.set(10, 10);
               tileView.setTileMap(dorkapon.tileMap);
               dorkapon.world.scene.addView(tileView);
               onResize();
            }
         };
      }]);
}
