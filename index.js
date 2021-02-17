import { Plugin } from '@vizality/entities';
import { patch, unpatch } from '@vizality/patcher';
import { getModule } from '@vizality/webpack';
import denylist from './denylist.json';

export default class ProtonActivityFixer extends Plugin {
  start () {
    this.patches = []
    this.activityModule = getModule('getGamesSeen');
    
    this.arrayPatch('seen', 'getGamesSeen')

    this.arrayPatch('running', 'getRunningGames')

    this.singlePatch('current', 'getCurrentGame')

    this.singlePatch('visible', 'getVisibleGame')
  }

  arrayPatch (name, fnc) {
    this.patch(name, fnc, (_, res) => {
      res = res.filter(x => !denylist.includes(x.name))
      return res
    });
  }

  singlePatch (name, fnc) {
    this.patch(name, fnc, (_, res) => {
      if (denylist.includes(res?.name)) {
        res = this.activityModule.getRunningGames().filter(x => !x.hidden)[0]
      }
      return res
    })
  }

  patch(name, fnc, cb) {
    name = 'proton-activity-fixer-' + name
    this.patches.push(name)
    patch(name, this.activityModule, fnc, cb)
  }

  stop () {
    this.patches.forEach(p => unpatch(p))
    this.patches = []
  }
}