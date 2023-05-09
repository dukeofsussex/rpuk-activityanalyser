import {
  differenceInDays,
  format,
  lastDayOfMonth,
  startOfMonth,
  sub,
} from 'date-fns';
import { deflateRaw, inflateRaw } from 'pako';
import {
  get,
  writable,
  type Subscriber,
  type Writable,
} from 'svelte/store';
import { PUBLIC_DISCORD_PROXY } from '$env/static/public';

interface Entry {
  id: number;
  discordId: string | null;
  name: string;
  rank: number;
}

interface ActivityEntry extends Entry {
  months: Record<string, number>;
}

interface ImportedEntry extends Entry {
  '7': number;
  '14': number;
  '30': number;
  '60': number;
}

const INTERVALS: [number, keyof ImportedEntry][] = [[7, '7'], [14, '14'], [30, '30'], [60, '60']];

class Report {
  hash: string;

  #rows: Writable<ActivityEntry[]>;

  constructor() {
    this.hash = '';
    this.#rows = writable([]);
  }

  async generate(csvs: string[]) {
    this.hash = Report.#hashCSVs(csvs);
    this.#rows.set([]);

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const dateMapping = csvs.map((csv) => ({ csv, date: new Date(csv.match(/\d{4}-\d{2}-\d{2}/)![0]) }));

    if (dateMapping.length) {
      dateMapping.sort((a, b) => b.date.getTime() - a.date.getTime());
    }

    for (let i = 0; i < dateMapping.length; i += 1) {
      const { csv, date } = dateMapping[i];
      const before = dateMapping[i + 1]?.date ?? startOfMonth(date);

      // eslint-disable-next-line no-await-in-loop
      const data = await Report.#fetchData(csv);

      this.#addData(data, date, before);
    }
  }

  subscribe(run: Subscriber<ActivityEntry[]>) {
    return this.#rows.subscribe(run);
  }

  // eslint-disable-next-line class-methods-use-this
  extract(reportId: string) {
    const converted = atob(reportId).split('').map((i) => i.charCodeAt(0));
    const inflated = inflateRaw(Uint8Array.from(converted), { to: 'string' });

    // Add the generic part back to the CSV url if necessary
    return inflated.split(',').map((csv: string) => (/^\d{19}\/\d{19}\//.test(csv) ? `https://cdn.discordapp.com/attachments/${csv}.csv` : csv));
  }

  #addData(entries: ImportedEntry[], date: Date, before: Date) {
    const rows = get(this.#rows);

    // Limit to 60 days
    const daysToCount = Math.min(differenceInDays(date, before), 60);

    const intervalIndex = INTERVALS.findIndex(([days]) => daysToCount <= days);
    const intervals = [INTERVALS[intervalIndex]];

    // If none of the data columns match the day count,
    // take base number from smaller column and calculate remainder from larger column
    if (intervalIndex !== 0 && daysToCount < intervals[0][0]) {
      intervals.unshift(INTERVALS[intervalIndex - 1]);
    }

    for (let i = 0; i < entries.length; i += 1) {
      const entry = entries[i];

      let index = rows.findIndex((r) => r.id === entry.id);

      if (index === -1) {
        rows.push({
          discordId: entry.discordId,
          id: entry.id,
          months: {},
          name: entry.name,
          rank: entry.rank,
        });

        index = rows.length - 1;
      }

      let daysLeft = daysToCount;
      let nextDate = date;
      const [interval, col] = intervals[0];
      let hours = entry[col] as number;

      // Calculate remainder from larger dataset
      if (intervals.length === 2) {
        const [remInterval, remCol] = intervals[1];

        hours += Math.ceil((entry[remCol] as number) - hours)
          * ((daysLeft - interval) / (remInterval - interval));
      }

      while (daysLeft > 0) {
        const key = format(nextDate, 'yyyy-MM');
        const monthlyRatio = Math.min(nextDate.getDate(), daysLeft);

        rows[index].months[key] = (rows[index].months[key] || 0)
          + Math.round(hours * (monthlyRatio / daysToCount));

        daysLeft -= monthlyRatio;
        nextDate = lastDayOfMonth(sub(nextDate, { months: 1 }));
      }
    }

    this.#rows.set(rows);
  }

  static async #fetchData(csv: string) {
    const url = csv.includes('cdn.discordapp.com')
      ? `${PUBLIC_DISCORD_PROXY}/${csv}`
      : csv;

    const data = await fetch(url).then((res) => res.text());
    const rows = data.split('\n');

    // Verify CSV format
    if (!rows[0].startsWith('Character')) {
      throw new Error(`Invalid CSV format for ${csv}`);
    }

    const hasDiscordId = rows[0].includes('Discord');

    const importedData: ImportedEntry[] = [];

    // Skip CSV header row
    for (let j = 1; j < rows.length; j += 1) {
      const parts = rows[j].split(',');
      let discordId = null;

      // Empty line
      if (!rows[j].includes(',')) {
        break;
      }

      // Old reports don't contain Discord ids
      if (hasDiscordId) {
        [discordId] = parts.splice(1, 1);
      }

      const [id, name, surname, rank, twoMonth, month, fortnight, week] = parts;

      importedData.push({
        discordId,
        id: parseInt(id, 10),
        name: `${name} ${surname}`,
        rank: parseInt(rank, 10),
        7: parseInt(week, 10),
        14: parseInt(fortnight, 10),
        30: parseInt(month, 10),
        60: parseInt(twoMonth, 10),
      });
    }

    return importedData;
  }

  static #hashCSVs(csvs: string[]) {
    // Extract the unique part from the CSV url
    const trimmed = csvs.map((csv) => csv.replace(/https?:\/\/cdn\.discordapp\.com\/attachments\/(.*).csv/, '$1')).join(',');
    const deflated = deflateRaw(trimmed, {
      level: 9,
    });

    let result = '';

    for (let i = 0; i < deflated.length; i += 1) {
      result += String.fromCharCode(deflated[i]);
    }

    return btoa(result);
  }
}

export default new Report();
