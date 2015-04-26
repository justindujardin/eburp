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

/// <reference path="../combatActionComponent.ts" />

module rpg.components.combat.actions {

  /**
   * Use magic in combat.
   */
  export class CombatMagicComponent extends CombatActionComponent {
    name:string = "magic";

    canBeUsedBy(entity:rpg.objects.GameEntityObject) {
      // Include only magic casters
      var supportedTypes = [
        rpg.models.HeroTypes.LifeMage,
        rpg.models.HeroTypes.Necromancer
      ];
      return super.canBeUsedBy(entity) && _.indexOf(supportedTypes, entity.model.get('type')) !== -1;
    }

    act(then?:rpg.states.IPlayerActionCallback):boolean {
      if (!this.isCurrentTurn()) {
        return false;
      }
      var done = (error?:any) => {
        then && then(this, error);
        this.combat.machine.setCurrentState(rpg.states.combat.CombatEndTurnState.NAME);
      };
      if (!this.spell) {
        console.error("null spell to cast");
        return false;
      }
      switch (this.spell.id) {
        case "heal":
          return this.healSpell(done);
          break;
        case "push":
          return this.hurtSpell(done);
          break;
      }
      return true;
    }

    healSpell(done?:(error?:any)=>any) {
      //
      var caster:rpg.objects.GameEntityObject = this.from;
      var target:rpg.objects.GameEntityObject = this.to;
      var attackerPlayer = <pow2.game.components.PlayerCombatRenderComponent>
          caster.findComponent(pow2.game.components.PlayerCombatRenderComponent);

      attackerPlayer.magic(()=> {
        var level:number = target.model.get('level');
        var healAmount:number = -this.spell.value;
        target.model.damage(healAmount);


        var hitSound:string = "/data/sounds/heal";
        var components = {
          animation: new pow2.tile.components.AnimatedSpriteComponent({
            spriteName: "heal",
            lengthMS: 550
          }),
          sprite: new pow2.tile.components.SpriteComponent({
            name: "heal",
            icon: "animSpellCast.png"
          }),
          sound: new pow2.scene.components.SoundComponent({
            url: hitSound,
            volume: 0.3
          })
        };
        target.addComponentDictionary(components);
        components.animation.once('animation:done', () => {
          target.removeComponentDictionary(components);
          var data:rpg.states.combat.CombatAttackSummary = {
            damage: healAmount,
            attacker: caster,
            defender: target
          };
          this.combat.machine.notify("combat:attack", data, done);
        });
      });

      return true;

    }

    hurtSpell(done?:(error?:any)=>any) {
      //
      var attacker:rpg.objects.GameEntityObject = this.from;
      var defender:rpg.objects.GameEntityObject = this.to;

      var attackerPlayer = <pow2.game.components.PlayerCombatRenderComponent>
          attacker.findComponent(pow2.game.components.PlayerCombatRenderComponent);
      attackerPlayer.magic(() => {
        var damage:number = defender.model.damage(this.spell.value);
        var didKill:boolean = defender.model.get('hp') <= 0;
        var hit:boolean = damage > 0;
        var hitSound:string = "/data/sounds/" + (didKill ? "killed" : (hit ? "spell" : "miss"));
        var components = {
          animation: new pow2.tile.components.AnimatedSpriteComponent({
            spriteName: "attack",
            lengthMS: 550
          }),
          sprite: new pow2.tile.components.SpriteComponent({
            name: "attack",
            icon: hit ? "animHitSpell.png" : "animMiss.png"
          }),
          damage: new rpg.components.DamageComponent(),
          sound: new pow2.scene.components.SoundComponent({
            url: hitSound,
            volume: 0.3
          })
        };
        defender.addComponentDictionary(components);
        components.damage.once('damage:done', () => {
          if (didKill && defender.model instanceof rpg.models.CreatureModel) {
            _.defer(() => {
              defender.destroy();
            });
          }
          defender.removeComponentDictionary(components);
        });
        var data:rpg.states.combat.CombatAttackSummary = {
          damage: damage,
          attacker: attacker,
          defender: defender
        };
        this.combat.machine.notify("combat:attack", data, done);
      });
      return true;

    }
  }
}