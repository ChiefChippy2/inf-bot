// Leaderboard scraped from hypixel.net, not guaranteed to work
import fetch from 'node-fetch';
import {JSDOM} from 'jsdom';

/**
 * Leaderboard
 */
export class Leaderboard {
  /**
   * Constructor
   * @param {string} type
   */
  constructor(type) {
    this.cache = {};
    this.cacheUntil = 0;
    this.type = type;
  }

  /**
   * Scrapes Leaderboard
   * @private
   */
  async scrape() {
    const lb = {
      infectedKills: [],
      survivorKills: [],
    };
    const req = await fetch(`https://hypixel.net/murder-mystery/leaderboard/${this.type}_murder_infection`, {
      method: 'GET',
      headers: {
        'user-agent': 'Mozilla/5.0 (Linux x86_64; rv:96.0) Gecko/20100101 Firefox/96.0',
        'referrer': 'https://hypixel.net/murder-mystery/leaderboard',
        'cache-control': 'no-cache',
        'accept-language': 'en-US,en;q=0.9',
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9',
      },
    });
    if (req.status !== 200) throw new Error('Failed to fetch: Status code is not 200');
    const resp = await req.text();
    const dom = new JSDOM(resp);
    dom.window.document.querySelector('.leaderboard > tbody').querySelectorAll('tr').forEach((el)=>{
      const ign = el.querySelector('.player > a').innerHTML?.trim?.() || '???';
      const rank = el.querySelector('.player > .rank-badge')?.innerHTML || 'Default';
      const guildTag = el.querySelector('.player > .guild-member-label > span')?.innerHTML;
      const [infectedKills, survivorKills] = Array.from(el.querySelectorAll('.data')).map((x)=>parseInt(x.innerHTML.replace(/\D/g, '')));
      lb.infectedKills.push({
        ign,
        rank,
        guildTag,
        infectedKills,
      });
      lb.survivorKills.push({
        ign,
        rank,
        guildTag,
        survivorKills,
      });
    });
    lb.infectedKills.sort((b, a)=>a.infectedKills - b.infectedKills);
    lb.survivorKills.sort((b, a)=>a.survivorKills - b.survivorKills);
    return lb;
  }

  /**
   * Updates LB if necessary
   * @private
   */
  async updateLB() {
    if (this.cacheUntil < Date.now()) this.cache = await this.scrape();
    this.cacheUntil += 1000 * 60 * 5;
  }

  /**
   * Gets LB
   * @return {Record<string, LeaderboardObject[]>}
   */
  async getLB() {
    await this.updateLB();
    return this.cache;
  }
}

export const lb = new Leaderboard('kills_as_infected');

/**
 * @typedef {Object} LeaderboardObject
 * @property {string} ign
 * @property {string} rank
 * @property {string|null} guildTag
 * @property {number} survivorKills
 * @property {number} infectedKills
 */
