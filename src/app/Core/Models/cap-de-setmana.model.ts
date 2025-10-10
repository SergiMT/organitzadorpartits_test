import { Match } from './match.model';

export class CapDeSetmana {
  private readonly _partits: Match[];

  constructor(
    public readonly dataInici: string,
    public readonly dataFi: string,
    partits: Match[] = [],
  ) {
    this._partits = [...partits];
  }

  get partits(): readonly Match[] {
    return [...this._partits];
  }

  afegeixPartit(partit: Match): void {
    this._partits.push(partit);
  }

  actualitzaPartit(index: number, partitActualitzat: Match): void {
    if (index < 0 || index >= this._partits.length) {
      return;
    }

    this._partits[index] = partitActualitzat;
  }

  eliminaPartit(index: number): void {
    if (index < 0 || index >= this._partits.length) {
      return;
    }

    this._partits.splice(index, 1);
  }
}
