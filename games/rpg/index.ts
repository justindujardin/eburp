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

/// <reference path="../../types/backbone/backbone.d.ts"/>
/// <reference path="../../types/angularjs/angular.d.ts"/>
/// <reference path="../../lib/pow2.d.ts"/>
/// <reference path="../../lib/pow2.ui.d.ts"/>

module rpg {
  export var app = angular.module('rpg', [
    'ngAnimate',
    'pow2',
    'templates-rpg',
    'ngSanitize',
    'ngTouch'
  ]);


  export interface IGameItem {
    name:string; // The item name
    cost:number; // The cost of this item
    icon:string; // Sprite icon name, e.g. LongSword.png
    usedby?:any[]; // `HeroType`s that can use this item.
  }

  export interface IGameWeapon extends IGameItem {
    attack:number; // Damage value
    hit:number; // 0-100%
  }

  export interface IGameArmor extends IGameItem {
    defense:number; // Defensive value
    evade:number; // Value to add to evasion <= 0
  }


// HeroView directive
// ----------------------------------------------------------------------------
  app.directive('heroCard', function () {
    return {
      restrict: 'E',
      scope: true,
      templateUrl: '/games/rpg/directives/heroCard.html',
      link: function ($scope:any, element, attrs) {
        $scope.hero = attrs.hero;
        $scope.$watch(attrs.hero, function (hero) {
          $scope.hero = hero;
        });
      }
    };
  });

}


//

